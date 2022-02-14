/**
 * NOTE: Some interfaces have been duplicated for now
 * TODO: Clean up later.
 */

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
    target: {
        ruleId: string;
        agentId: string;
        result: boolean | number;
        actions: Array<Action>;
    };
}
export interface AgentResult {
    agentId: string;
    jobId: string;
    jobOwner: string;
    agentName: string;
    data: any;
    timestamp: Date;
}
export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    targets: Array<TargetAgent>;
}

export interface TargetAgent {
    agentId: string;
    actions: Array<Action>;
}

interface Action {
    id?: string;
    type: string;
    params: Array<Parameter>;
}
interface Parameter {
    key: string;
    value: string | number | boolean;
}
