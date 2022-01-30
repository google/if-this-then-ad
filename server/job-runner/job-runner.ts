const { PubSub } = require('@google-cloud/pubsub');
import log from '../util/logger';
import OpenWeatherMap from '../agents/source-agents/open-weather-map';
import { AgentResult } from '../agents/source-agents/open-weather-map/interfaces';
import { Job , ExecutionTime, _Timestamp} from './interfaces'
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from "../models/fire-store-entity";

//TODO: deal with leaking firestore _Timestamp object


// setting up useful date manipulation functions
// wrapping them into date object to make it easier
// to remember what we are dealing with. 
const date = {
    add: require('date-fns/add'), 
    isAfter: require('date-fns/isAfter'), 
    isBefore:require('date-fns/isBefore'),
    isValid: require('date-fns/isValid')
}

//TODO: replace this with sending messages over pubsub. 
//Temp coupling between packages/ 
import rulesEngine from '../packages/rule-engine'
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
        let fullTopicName = `projects/${process.env.PROJECT_ID}/topics/${name}`;
        let topic = await this.getTopic(fullTopicName);
        const subsId = process.env.AGENTS_TOPIC_ID + '_subs';
        try {

            if (topic == null) {
                await this.client.createTopic(name);
                log.info(`New topic created : ${fullTopicName}`)
                topic = await this.getTopic(fullTopicName);
                // Creates a subscription on that new topic
                const [subscription] = await topic.createSubscription(subsId);
                log.info(`Subscription ${subsId} for topic ${topic.name} created`);
                return topic;
            }

            const [subscriptions] = await topic.getSubscriptions();

            const existingSubscription = subscriptions.filter(s => {
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

        return topic
    }
    private listAgents() {
        return { 'open-weather-map-agent': new OpenWeatherMap() }
    }

    private async *runJobs(jobs: Job[]) {


        const agents = this.listAgents();

        for (let job of jobs) {

            const agent = agents[job.agentId];
            log.info(`Executing job ${job.id} via agent ${job.agentId}`)
            yield await agent.execute(job)
        }

    }

    private async updateJobExecutionTimes(jobs: Array<ExecutionTime>){

        for(let j of jobs){
            let job = await this.jobsRepo.get(j.jobId);
            if (job){
                job.lastExecution = _Timestamp.now();
                await this.jobsRepo.update(j.jobId, job); 
                log.info(`Set lastExecution time: ${j.lastExecution} on job : ${j.jobId}`)
            }
        }
    }
    public async runAll() {

        // get a list of jobs to execute 
        log.info('Fetching job list to execute'); 
        const allJobs: Job[] = await this.jobsRepo.list();
        // filter by execution interval 
        let now = Date.now();
        console.log(now);
        let offset = new Date().getTimezoneOffset();
        offset = offset * 1000; // in sec
        let nowUTC = new Date(now+offset); 

        log.debug(`offset : ${offset}`); 


        const jobs = allJobs.filter(j => {
            // for first time executions 
          
            // lastExecution isnt set yet. 
            if(!date.isValid(j.lastExecution?.toDate())){
                log.debug(`Invalid date in last execution ${j.id}`); 
                log.debug(j.lastExecution?.toDate())
                return true; 
            }
  
            let nextRuntime = date.add(j.lastExecution?.toDate(), {minutes: j.executionInterval});
            log.info(`Job: ${j.id} next execution : ${nextRuntime}`);
            log.debug(`System time : ${nowUTC}`);
            return date.isBefore(nextRuntime, nowUTC); 
        });
        const jobCount = jobs.length; 
        log.debug('List of jobs to execute');
        log.info(`Got ${jobCount} jobs to execute`); 
        log.debug(jobs); 
        if(jobCount ==0){
            log.info('Sleeping till next execution cycle'); 
            return 
        }
        

        // const topic = await this.init();

        // execute each job agent 
        // await for yielded results 
        log.info('Executing jobs on all available agents');
        let jobResultIter = this.runJobs(jobs);
        let jobResult = jobResultIter.next();

        // collect all actions that need to be performed
        // on the target systems.
        let targetActions: Array<RuleResult[]> = []
        let executionTimes:Array<ExecutionTime> = []; 

        while (!(await jobResult).done) {
            // pass this to rules engine. 
            const currentResult: AgentResult = (await jobResult).value;

            log.info('Publishing results to the rule engine');
            log.info(`Completed job: ${currentResult.jobId}`); 
            log.debug(currentResult); 
            const execTime:ExecutionTime = {'jobId': currentResult.jobId, 'lastExecution': currentResult.timestamp}; 
            executionTimes.push(execTime); 

            const results: Array<RuleResult> = await rulesEngine.processMessage(currentResult);
            // targetActions.push(results);
            jobResult = jobResultIter.next();
        }
        log.info('Updating Last execution time of jobs')
        // update execution times in the jobs collection. 
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