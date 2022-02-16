export interface AgentResult {
    agentId: string;
    jobId: string;
    agentName: string;
    data: any;
    timestamp: Date;
}

export enum COMPARATORS {
    equals = 'eq',
    greater = 'gt',
    less = 'lt',
    yes = 'yes',
    no = 'no',
}

export interface Rule {
    id: string;
    name: string;
    owner: string;
    source: {
        id: string;
        name: string;
    };
    condition: {
        name: string;
        dataPoint: string;
        comparator:
            | COMPARATORS.equals
            | COMPARATORS.greater
            | COMPARATORS.less
            | COMPARATORS.yes
            | COMPARATORS.no;
        value: string | number | boolean;
    };
    executionInterval: number;
    jobId: string;
    targets?: Array<TargetAgent>;
}

export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    targets: Array<TargetAgent>;
}

interface Parameter {
    key: string;
    value: string | number | boolean;
}

interface Action {
    id?: string;
    type: string;
    params: Array<Parameter>;
}

export interface TargetAgent {
    agentId: string;
    actions: Array<Action>;
}
