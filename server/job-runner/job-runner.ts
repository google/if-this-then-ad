const { PubSub } = require('@google-cloud/pubsub');
import log from '../util/logger';
import { config } from '../agents/source-agents/open-weather-map/config';
import OpenWeatherMap from '../agents/source-agents/open-weather-map';
import { AgentResult } from '../agents/source-agents/open-weather-map/interfaces';
import { Job } from './interfaces'

//TODO: replace this with sending messages over pubsub. 
//Temp coupling between packages/ 
import rulesEngine from '../packages/rule-engine'
import { RuleResult } from '../packages/rule-engine/src/interfaces';



const pubSubClient = new PubSub();


class JobRunner {

    client: any;

    constructor(client: any) {
        this.client = client;
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
            log.info(`Executing job ${job.jobId} via agent ${job.agentId}`)
            yield await agent.execute(job)
        }

    }

    public async runAll() {
       

        // get a list of jobs to execute 
        // mocked for now. 
        const jobs: Array<Job> = [{
            jobId: '1',
            agentId: 'open-weather-map-agent',
            query: {
                'dataPoint': 'targetLocation',
                'value': 'Berlin, de'
            }
        }, {
            jobId: '2',
            agentId: 'open-weather-map-agent',
            query: {
                'dataPoint': 'targetLocation',
                'value': 'Hamburg, de'
            }
        }, {
            jobId: '3',
            agentId: 'open-weather-map-agent',
            query: {
                'dataPoint': 'targetLocation',
                'value': 'Munich, de'
            }
        }
        ]

        // const topic = await this.init();

        // execute each job agent 
        // await for yielded results 
        log.info('Executing jobs on all available agents');
        let jobResultIter = this.runJobs(jobs);
        let jobResult = jobResultIter.next();
        
        // collect all actions that need to be performed
        // on the target systems.
        let targetActions:Array<RuleResult[]> = []

        while(!(await jobResult).done){
            // pass this to rules engine. 
            const currentResult:AgentResult = (await jobResult).value;

            log.info('Publishing results to the rule engine'); 
            // log.debug(JSON.stringify(currentResult)); 
            const results:Array<RuleResult> = await rulesEngine.processMessage(currentResult); 
            targetActions.push(results);
            jobResult = jobResultIter.next();
        }

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

export default new JobRunner(pubSubClient);