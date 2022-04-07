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
                        value: 'wt-j7hG8SR7saKOgaP8q7Q',
                    },
                    {
                        key: 'externalManagerCustomerId',
                        value: '5669196387',
                    },
                    {
                        key: 'externalCustomerId',
                        value: '9044713567',
                    },
                    {
                        key: 'entityId',
                        value: '134813889282',
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
        'wt-j7hG8SR7saKOgaP8q7Q',
        '5669196387',
        '9044713567',
        'adGroup',
        '16161784759', true)
    .then((x) => console.log(x))
    .catch((x) => console.log(x.response?.data?.error || x));

googleAdsAgent.getEntityList(
        oauthToken,
        'wt-j7hG8SR7saKOgaP8q7Q',
        '5669196387',
        '9044713567',
        'campaign', undefined, true)
    .then((x) => console.log(x))
    .catch((x) => console.log(x.response.data.error));
