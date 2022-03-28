
require('module-alias/register');
import env from 'dotenv';
import {
    IAgent,
    AgentResponse,
    Configuration,
    AgentResult,
    WeatherCodes,
    AgentMetadata,
    AgentType,
    Job
} from './interfaces';
import AmbeeAgent from './ambee';

env.config();

const job: Job = {
    id: 'JOB-ID',
    agentId: '',
    owner: '',
    executionInterval: 10,
    query: [{
        dataPoint: 'targetLocation',
        value: 'Hamburg, Germany',
    }],
    rules: ['x6MieD5wubokdJnkVHMN'],
    ownerSettings: {
        agentId: 'ambee',
        params: [{
            key: 'apiKey',
            value: '103e6642ddbbd60a5f4cecf9a9bf910accb5dbbb50d369a65b5b7ed710d5dbec',
        }]
    }
};

const ambee = new AmbeeAgent();
/*
ambee.execute(job).then(x => console.log(x)).catch(x => console.error(x));

if (job.query) {
    job.query.value = 'Lhasa';
    ambee.execute(job).then(x => console.log(x)).catch(x => console.error(x));
}
*/
if (job.query) {
    job.query.value = 'Deshpande Nagar';
    job.rules = [ "aqvgsD1Fe1HfmuigQi6N" ];
    ambee.execute(job).then(x => console.log(x)).catch(x => console.error(x));
}