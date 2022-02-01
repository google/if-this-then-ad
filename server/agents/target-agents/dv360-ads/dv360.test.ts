import DV360 from './index';
import { Job } from './interfaces';

const job: Job = {
    id: 'DV360-Test',
    agentId: 'dv360-agent',
    update: [
        {
            key: 'authToken',
            value: '',
        },
        {
            // Key value should be simple string|number|boolean
            key: 'targetEntity',
            value: {
                id: 50389587,
                advertiserID: 4304640,
                type: 'LI',
            },
        },
        {
            key: 'action',
            value: 'activate',
        },
    ],
};

const dv360 = new DV360();
console.log(dv360.execute(job));