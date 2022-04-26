import googleAdsAgent from './index';
import { AgentTask, EntityType } from './interfaces';

const oauthToken = '';

const task: AgentTask = {
    token: {
        auth: oauthToken
    },
    target: {
        ruleId: '111',
        agentId: 'GoogleAds',
        result: true,
        actions: [
            {
                type: 'activate',
                params: [
                    {
                        key: 'developerToken',
                        value: '',
                    },
                    {
                        key: 'externalManagerCustomerId',
                        value: '',
                    },
                    {
                        key: 'externalCustomerId',
                        value: '',
                    },
                    {
                        key: 'entityId',
                        value: '',
                    },
                    {
                        key: 'entityType',
                        value: 'adGroup',
                    },
                ],
            },
        ],
    },
};
googleAdsAgent.execute(task)
    .then((x) => console.log(x))
    .catch((x) => console.log(x.response?.data?.error || x));

googleAdsAgent.getEntityList(
        oauthToken,
        '',
        '',
        '',
        'adGroup',
        '', true)
    .then((x) => console.log(x))
    .catch((x) => console.log(x.response?.data?.error || x));

googleAdsAgent.getEntityList(
        oauthToken,
        '',
        '',
        '',
        'campaign', undefined, true)
    .then((x) => console.log(x))
    .catch((x) => console.log(x.response.data.error));
