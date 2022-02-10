const { PubSub } = require('@google-cloud/pubsub');
import OpenWeatherMap from '../agents/source-agents/open-weather-map';
import { AgentResult } from '../agents/source-agents/open-weather-map/interfaces';
import { Job, ExecutionTime, _Timestamp } from './interfaces';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { log } from '@iftta/util';

//TODO: deal with leaking firestore _Timestamp object

// setting up useful date manipulation functions
// wrapping them into date object to make it easier
// to remember what we are dealing with.
const date = {
    add: require('date-fns/add'),
    isAfter: require('date-fns/isAfter'),
    isBefore: require('date-fns/isBefore'),
    isValid: require('date-fns/isValid'),
};

//TODO: replace this with sending messages over pubsub.
//Temp coupling between packages/
import rulesEngine from '../packages/rule-engine';
import { RuleResult } from '../packages/rule-engine/src/interfaces';

const pubSubClient = new PubSub();
const jobsCollection = Collections.get(Collection.JOBS);
const repo = new Repository<Job>(jobsCollection);

class JobRunner {
    client: any;
    jobsRepo: Repository<Job>;

    constructor(client: any, repository: Repository<Job>) {
        this.client = client;
        this.jobsRepo = repository;
    }

    private async getTopic(name: string) {
        const [topics] = await this.client.getTopics();
        const topicResult = topics.filter((topic) => {
            return topic.name == name;
        });

        if (topicResult.length > 0) {
            return topicResult[0];
        }
        return null;
    }

    // TODO: define schemas
    // add to topic creation processd
    private async createTopicIfNotExists(name: string) {
        //projects/if-this-then-ad/topics/
        const fullTopicName = `projects/${process.env.PROJECT_ID}/topics/${name}`;
        let topic = await this.getTopic(fullTopicName);
        const subsId = process.env.AGENTS_TOPIC_ID + '_subs';

        try {
            if (topic == null) {
                await this.client.createTopic(name);
                log.info(`New topic created : ${fullTopicName}`);
                topic = await this.getTopic(fullTopicName);
                // Creates a subscription on that new topic
                const [subscription] = await topic.createSubscription(subsId);
                log.info(`Subscription ${subsId} for topic ${topic.name} created`);
                return topic;
            }

            const [subscriptions] = await topic.getSubscriptions();

            const existingSubscription = subscriptions.filter((s) => {
                return s.name == subsId;
            });

            if (!existingSubscription) {
                log.info('Found existing topic, but missing a subscription');
                await topic.createSubscription(subsId);
                log.info(`Subscription ${subsId} created on existing topic. ${fullTopicName}`);
            }
            log.info(`Topic ${name} exists, skipping creation`);
        } catch (err) {
            log.error(JSON.stringify(err));
        }

        return topic;
    }

    /**
     * Initializes Pubsub topics
     */
    public async init() {
        const topicName: string = process.env.AGENTS_TOPIC_ID || 'agent-results';
        const topic = await this.createTopicIfNotExists(topicName);

        return topic;
    }

    private listAgents() {
        return {
            'open-weather-map': new OpenWeatherMap(),
        };
    }

    private async *runJobs(jobs: Job[]) {
        const agents = this.listAgents();

        log.debug('runJobs jobs');
        log.debug(jobs);

        for (const job of jobs) {
            const agent = agents[job.agentId];
            log.info(`Executing job ${job.id} via agent ${job.agentId}`);
            yield await agent.execute(job);
        }
    }

    private async updateJobExecutionTimes(jobs: Array<ExecutionTime>) {
        for (const j of jobs) {
            const job = await this.jobsRepo.get(j.jobId);
            if (job) {
                job.lastExecution = _Timestamp.now();
                await this.jobsRepo.update(j.jobId, job);
                log.info(`Set lastExecution time: ${j.lastExecution} on job : ${j.jobId}`);
            }
        }
    }

    /**
     * Get current time in UTC.
     *
     * @returns {Date}
     */
    private getNowInUTC(): Date {
        const now = Date.now();
        const offsetSec = new Date().getTimezoneOffset() * 1000;
        const nowUTC = new Date(now + offsetSec);
        log.debug(`TZ offset : ${offsetSec} `);
        log.info(`System time used for calculating Execution interval ${nowUTC}`);

        return nowUTC;
    }

    /**
     * Get all jobs that are up for execution.
     *
     * @returns {Promise<Array<Job>>}
     */
    private async getEligibleJobs(): Promise<Array<Job>> {
        // Get a list of jobs to execute
        log.info('Fetching job list to execute');
        const allJobs: Job[] = await this.jobsRepo.list();

        // Filter by execution interval
        const nowUTC = this.getNowInUTC();
        log.info(`Filtering jobs that have reached execution interval`);

        const jobs = allJobs.filter((j) => {
            // For first time executions lastExecution will not be set
            if (!date.isValid(j.lastExecution?.toDate())) {
                log.debug(`Invalid date in last execution ${j.id}`);
                log.debug(j.lastExecution?.toDate());

                return true;
            }

            const nextRuntime = date.add(j.lastExecution?.toDate(), {
                minutes: j.executionInterval,
            });
            log.info(`Job: ${j.id} next execution : ${nextRuntime}`);

            return date.isBefore(nextRuntime, nowUTC);
        });

        return jobs;
    }

    public async runAll() {
        // Get a list of jobs to execute
        log.info('Fetching job list to execute');
        const allJobs: Job[] = await this.jobsRepo.list();

        // Filter by execution interval
        const now = Date.now();
        const offsetSec = new Date().getTimezoneOffset() * 1000;
        const nowUTC = new Date(now + offsetSec);

        log.debug(`offset : ${offsetSec}`);

        const jobs = await this.getEligibleJobs();
        const jobCount = jobs.length;
        log.debug('List of jobs to execute');
        log.info(`Got ${jobCount} jobs to execute`);
        log.debug(jobs);

        if (jobCount == 0) {
            log.info('Sleeping till next execution cycle');
            return;
        }

        // const topic = await this.init();

        // execute each job agent
        // await for yielded results
        log.info('Executing jobs on all available agents');
        const jobResultIter = this.runJobs(jobs);
        let jobResult = jobResultIter.next();

        // Collect all actions that need to be performed
        // on the target systems.
        const targetActions: Array<RuleResult[]> = [];
        const executionTimes: Array<ExecutionTime> = [];

        while (!(await jobResult).done) {
            log.debug('my jobResult');
            log.debug(await jobResult);
            // pass this to rules engine.
            const currentResult: AgentResult = (await jobResult).value;
            log.info('Publishing results to the rule engine');
            log.info(`Completed job: ${currentResult.jobId}`);
            log.debug(currentResult);
            const execTime: ExecutionTime = {
                jobId: currentResult.jobId,
                lastExecution: currentResult.timestamp,
            };
            executionTimes.push(execTime);

            const results: Array<RuleResult> = await rulesEngine.processMessage(currentResult);
            log.debug('evaluation result');
            log.debug(results);
            // targetActions.push(results);
            jobResult = jobResultIter.next();
        }

        log.info('Updating Last execution time of jobs');

        // Update execution times in the jobs collection
        await this.updateJobExecutionTimes(executionTimes);

        // call target-agents to execute individual actions

        // publish results to pubsub.
        // while (!(await jobResult).done) {
        //     const currentResult = (await jobResult).value
        //     log.debug('Got result ')
        //     log.debug(JSON.stringify(currentResult));
        //     // publish to the topic created.
        //     await topic.publish(Buffer.from(JSON.stringify(currentResult)));
        //     log.debug('Published results to PubSub')
        //     jobResult = jobResultIter.next();
        // }
    }
}

export default new JobRunner(pubSubClient, repo);
