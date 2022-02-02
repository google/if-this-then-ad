import DV360 from './index';
import { TargetAction } from './interfaces';

const action: TargetAction = {
    action: 'Activate DV360',
    params: [
        {
            key: 'authToken',
            value: '',
        },
        {
            key: 'action',
            value: 'activate',
        },
        {
            key: 'entityId',
            value: 50389587,
        },
        {
            key: 'entityAdvertiserId',
            value: 4304640,
        },
        {
            key: 'entityType',
            value: 'LI',
        },
    ],
};

const dv360 = new DV360();
dv360.execute(action).then(x => console.log(x));