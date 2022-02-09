
import dv360agent from './index'
import {AgentTask} from './interfaces';

const task: AgentTask = {
    tokens: {
        auth: '',
    },
    ruleResult: {
        ruleId: '123',
        result: true, 
        actions: [ { 
            action: 'Some Action',
            params: [
                {
                    key: 'action',
                    value: 'pause',
                },
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
                    value: 'LineItem',
                },
            ],
        }, { 
            action: '#2 Error Action',
            params: [
                {
                    key: 'action',
                    value: 'activate',
                },
                {
                    key: 'entityId',
                    value: 1231250389587,// non-existing id
                },
                {
                    key: 'parentId',
                    value: 4304640,
                },
                {
                    key: 'entityType',
                    value: 'LineItem',
                },
            ],
        }, { 
            action: '#3 Action',
            params: [
                {
                    key: 'action',
                    value: 'activate',
                },
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
                    value: 'InsertionOrder',
                },
            ],
        }]
    },
};

dv360agent.execute(task)
    .then(x => console.log(x));