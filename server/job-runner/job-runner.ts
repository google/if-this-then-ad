const { PubSub } = require('@google-cloud/pubsub');
import log from '../util/logger';
import { config } from '../agents/source-agents/open-weather-map/config';
import OpenWeatherMap from '../agents/source-agents/open-weather-map';


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

        if (topic == null) {
            await this.client.createTopic(name);
            log.info(`New topic created : ${fullTopicName}`)
            topic = await this.getTopic(fullTopicName);
            const subsId = process.env.AGENTS_TOPIC_ID + '_subs';
            // Creates a subscription on that new topic
            const [subscription] = await topic.createSubscription(subsId);
            log.info(`Subscription ${subsId} for topic ${topic.name} created`);
            return topic;
        }
        log.info(`Topic ${name} exists, skipping creation`);
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

    private async *runJobs() {
        // Pull jobs data from firebase 
        // foreach job execute  
        // TODO extend config to include job definition
        // firestore.getJobs().filter((j) => {
        //     j.interval < 
        // })

        // const job = {
        //     agentId: 'open-weather-map', 
        //     interval: 30, 
        //     location: 'Berlin'
        // }

        // const jobs = [];
        
        // agents


        // jobs.forEach((job) => {

        //     const agent = agents.get(job.agentId); 
        //    const result =  agent.execute(job);
        //     // publish this back pubsub 
        // })



        const berlinConfig = config;
        let hamburgConfig = Object.create(config);

        hamburgConfig.queryLocation = 'Hamburg, de';

        const hamburgAgent = new OpenWeatherMap();
        const berlinAgent = new OpenWeatherMap();

        const hamburg = await hamburgAgent.execute(hamburgConfig);
        yield hamburg;
        const berlin = await berlinAgent.execute(berlinConfig)
        yield berlin;
        // results need to be placed into respective PubSub Topic
    }

    public async runAll() {
        const topic = await this.init();

        // get a list of jobs to execute 

        // execute each job agent 
        // await for yielded results 
        let jobResultIter = this.runJobs();
        let jobResult = jobResultIter.next();

        while (!(await jobResult).done) {
            const currentResult = (await jobResult).value

            // publish to the topic created. 
            await topic.publish(Buffer.from(JSON.stringify(currentResult)));
            jobResult = jobResultIter.next();
        }

    }
}

export default new JobRunner(pubSubClient);