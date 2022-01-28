export interface AgentResult {
    agentId: string,
    jobId: string,
    agentName: string,
    targetLocation: string,
    temperature: number,
    windSpeed: number,
    clouds: boolean,
    rain: boolean,
    snow: boolean,
    thunderstorm: boolean,
    clearSky: boolean,
    timestamp: Date
}

export enum CONDITIONS {
    equals = 'eq',
    greater = 'gt',
    less = 'lt'
}

export interface Rule {
    ruleId: string,
    jobId: string,
    agentId: string,
    agentName: string,
    ruleName: string,
    ruleDatapoint: string,
    ruleCondition: CONDITIONS.equals | CONDITIONS.greater | CONDITIONS.less,
    ruleTargetValue: string | number | boolean,
    targets?: Array<TargetAgent>
}

export interface RuleResult {
    ruleId: string,
    result: boolean | number, 
    target: Array<TargetAgent>
}

interface actionParam {
    param: string,
    value: string | number | boolean
}
interface TargetActions {
    action: string,
    actionParams: Array<actionParam>
}

export interface TargetAgent {
    agentId: string,
    ruleResult: RuleResult,
    actions: Array<TargetActions>
}