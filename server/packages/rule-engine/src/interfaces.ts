export interface AgentResult {
    agentId: string;
    jobId: string;
    agentName: string;
    targetLocation: string;
    temperature: number;
    windSpeed: number;
    clouds: boolean;
    rain: boolean;
    snow: boolean;
    thunderstorm: boolean;
    clearSky: boolean;
    timestamp: Date;
}

export enum CONDITIONS {
    equals = 'eq',
    greater = 'gt',
    less = 'lt',
    yes = 'yes',
    no = 'no',
}

export interface Rule {
    id: string;
    agent: {
        id: string;
        name: string;
    };
    rule: {
        name: string;
        dataPoint: string;
        condition:
            | CONDITIONS.equals
            | CONDITIONS.greater
            | CONDITIONS.less
            | CONDITIONS.yes
            | CONDITIONS.no;
        value: string | number | boolean;
        interval: number;
    };
    jobId: string;
    targets?: Array<TargetAgent>;
}

export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    target: Array<TargetAgent>;
}

interface actionParam {
    param: string;
    value: string | number | boolean;
}
interface TargetActions {
    action: string;
    actionParams: Array<actionParam>;
}

export interface TargetAgent {
    agentId: string;
    actions: Array<TargetActions>;
}
