const { PubSub } = require('@google-cloud/pubsub');
import { log, date } from '@iftta/util';
import OpenWeatherMap from '../agents/source-agents/open-weather-map';
import { AgentResult } from '../agents/source-agents/open-weather-map/interfaces';
import { Collection } from '../models/fire-store-entity';
//TODO: replace this with sending messages over pubsub.
//Temp coupling between packages/
import rulesEngine from '../packages/rule-engine';
import { RuleResult } from '../packages/rule-engine/src/interfaces';
import Collections from '../services/collection-factory';
import Repository from '../services/repository-service';
import { ExecutionTime, Job } from './interfaces';
import BackgroundAuth from './refresh-tokens';

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
                job.lastExecution = new Date();
                await this.jobsRepo.update(j.jobId, job);
                log.info(`Set lastExecution time: ${j.lastExecution} on job : ${j.jobId}`);
            }
        }
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
        const nowUTC = new Date();
        log.info(`System time used for calculating Execution interval ${nowUTC}`);
        log.info(`Filtering jobs that have reached execution interval`);

        const jobs = allJobs.filter((j) => {
            // For first time executions lastExecution will not be set
            if (!date.isValid(j.lastExecution)) {
                log.debug(`Invalid date in last execution ${j.id}`);
                log.debug(j.lastExecution);
                j.lastExecution = 0;
                return true;
            }
            log.debug(`job-runner:getEligibleJobs: jobTime: ${j.id} : ${j.lastExecution}`);
            const nextRuntime = date.add(j.lastExecution!, { minutes: j.executionInterval });
            log.info(`Job: ${j.id} next execution : ${nextRuntime}`);

            return date.isPast(nextRuntime);
        });

        return jobs;
    }

    public async runAll() {
        // Get a list of jobs to execute
        log.info('job-runner:runAll: Fetching job list to execute');
        const jobs = await this.getEligibleJobs();
        const jobCount = jobs.length;
        log.debug('job-runner:runAll: List of jobs to execute');
        log.info(`job-runner:runAll: Got ${jobCount} jobs to execute`);
        log.debug(jobs);

        if (jobCount == 0) {
            log.info('job-runner:runAll: Sleeping till next execution cycle');
            return;
        }

        // const topic = await this.init();

        // execute each job agent
        // await for yielded results
        log.info('job-runner:runAll: Executing jobs on all available agents');
        const agentResultIter = this.runJobs(jobs);
        let agentResult = agentResultIter.next();

        // Collect all actions that need to be performed
        // on the target systems.
        const executionTimes: Array<ExecutionTime> = [];
        const allResults: Array<Array<RuleResult>> = [[]];

        while (!(await agentResult).done) {
            log.debug('job-runner:runAll: jobResult');
            log.debug(await agentResult);
            // pass this to rules engine.
            const currentResult: AgentResult = (await agentResult).value;
            log.info('Publishing results to the rule engine');
            log.info(`Completed job: ${currentResult.jobId}`);
            log.debug(currentResult);
            const execTime: ExecutionTime = {
                jobId: currentResult.jobId,
                lastExecution: currentResult.timestamp,
            };
            executionTimes.push(execTime);

            const results: Array<RuleResult> = await rulesEngine.processMessage(currentResult);
            allResults.push(results);
            log.debug('evaluation result');
            log.debug(results);
            // targetActions.push(results);
            agentResult = agentResultIter.next();
        }

        log.info('Updating Last execution time of jobs');

        // Update execution times in the jobs collection
        await this.updateJobExecutionTimes(executionTimes);

        // TODO: obtain user ID from the Rule object
        // obtain freshTokens before running the jobs
        const userId = 'YrqYQc15jFYutbMdZNss';
        const token = await BackgroundAuth.refreshTokensForUser(userId);

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

    public async processTargets(results: Array<RuleResult>) {}
}

export default new JobRunner(pubSubClient, repo);
