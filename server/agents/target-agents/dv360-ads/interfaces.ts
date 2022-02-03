
export interface RuleResult {
    ruleId: string,
    result: boolean | number, 
    actions: Array<TargetAction>
}

export interface actionParam {
    key: string,
    value: string | number | boolean
}

export interface TargetAction {
    action: string,
    params: Array<actionParam>
}

export interface AgentOptions {
    key: string,
    value: string|number|boolean,
}

export interface TargetAgent {
    id: string,
    actions: Array<TargetAction>
}

export interface Tokens {
    refresh?: string,
    auth: string,
}

export interface AgentTask {
    tokens: Tokens,
    ruleResult: RuleResult,
}

export enum EntityType {
    LI = 'lineItems',
    IO = 'insertionOrders'
}

export enum EntityStatus {
    ACTIVATE = 'ENTITY_STATUS_ACTIVE',
    DEACTIVATE = 'ENTITY_STATUS_PAUSED'
}

export  interface ActionResult {
    ruleId: string,
    action: string,
    displayName: string,
    entityStatus: string,
    timestamp: Date,
    success: boolean,
    error: string,
}