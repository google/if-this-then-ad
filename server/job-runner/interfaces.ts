import * as firestore from '@google-cloud/firestore';

export interface Job {
    id?: string;
    agentId: string;
    executionInterval: number;
    lastExecution?: Date | number;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
}
export interface ExecutionTime {
    jobId: string;
    lastExecution: Date;
}

export interface AgentTask {
    token: {
        auth: string;
    };
    ruleResult: {
        ruleId: string;
        result: boolean;
        actions: Array<Action>;
    };
}

interface Action {
    type: string;
    params: Array<Parameter>;
}
interface Parameter {
    key: string;
    value: string;
}
