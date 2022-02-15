import dv360agent from './index';
import { AgentTask } from './interfaces';

const task: AgentTask = {
    token: {
        auth: '',
    },
    target: {
        ruleId: '123',
        agentId: 'DV360',
        result: false,
        actions: [
            {
                type: 'activate',
                params: [
                    {
                        key: 'entityId',
                        value: 50389587,
                    },
                    {
                        key: 'parentId',
                        value: 4304640,
                    },
                    {
                        key: 'entityType',
                        value: 'lineItem',
                    },
                ],
            },
            {
                type: 'pause',
                params: [
                    {
                        key: 'entityId',
                        value: 1231250389587, // non-existing id
                    },
                    {
                        key: 'parentId',
                        value: 4304640,
                    },
                    {
                        key: 'entityType',
                        value: 'lineItem',
                    },
                ],
            },
            {
                type: 'pause',
                params: [
                    {
                        key: 'entityId',
                        value: 19345182,
                    },
                    {
                        key: 'parentId',
                        value: 4304640,
                    },
                    {
                        key: 'entityType',
                        value: 'insertionOrder',
                    },
                ],
            },
        ],
    },
};

dv360agent.execute(task).then((x) => console.log(x));
