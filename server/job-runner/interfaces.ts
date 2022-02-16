/**
 * NOTE: Some interfaces have been duplicated for now
 * TODO: Clean up later.
 */

export interface Job {
    id?: string;
    agentId: string;
    owner: string;
    executionInterval: number;
    lastExecution?: Date | number;
    ownerSettings?: setting;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
    rules: Array<string>;
}

export interface setting {
    agentId: string;
    params: Array<parameter>;
}
interface parameter {
    key: string;
    value: string | number | boolean;
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
