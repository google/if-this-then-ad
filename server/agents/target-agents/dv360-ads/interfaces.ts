export interface AgentResult {
    agentId: string;
    jobId: string;
    agentName: string;
    timestamp: Date;
    success: boolean;
}

export interface IAgent {
    agentId: string;
    name: string;
    execute(task: AgentTask): Promise<Array<ActionResult>>;
    getAgentMetadata(): Promise<AgentMetadata>;
}

export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    actions: Array<TargetAction>;
}

export interface actionParam {
    key: string;
    value: string | number | boolean;
}

export interface TargetAction {
    action: string;
    params: Array<actionParam>;
}

export interface AgentOptions {
    key: string;
    value: string | number | boolean;
}

export interface TargetAgent {
    id: string;
    actions: Array<TargetAction>;
}

export enum EntityActions {
    ACTIVATE = 'activate',
    PAUSE = 'pause',
}

// Whatever we get from the client
export enum EntityType {
    lineItem = 'lineItem',
    insertionOrder = 'insertionOrder',
    campaign = 'campaign',
    advertiser = 'advertiser',
    partner = 'partner',
}

export enum EntityStatus {
    ACTIVE = 'ENTITY_STATUS_ACTIVE',
    PAUSED = 'ENTITY_STATUS_PAUSED',
}

export interface InstanceOptions {
    entityType: string;
    parentId?: number;
    entityId?: number;
    action?: string;
}

export interface ActionResult {
    ruleId: string;
    agentId: string;
    displayName: string;
    entityStatus: string;
    timestamp: Date;
    success: boolean;
    error: string;
}

export interface DV360ApiClientOptions {
    authToken: string;
    baseUrl: string;
}

export enum httpMethods {
    PATCH = 'PATCH',
    GET = 'GET',
}

export interface DV360ApiCallOptions {
    httpMethod: httpMethods;
    url: string;
    data: Object;
}

export interface ApiCallParams {
    url: string;
    params?: Object;
    data?: Object;
    method?: httpMethods;
}

export enum AgentType {
    SOURCE = 'source-agent',
    TARGET = 'target-agent',
}

export interface ApiMethodInfo {
    dataPoint: string;
    list: ApiCallParams;
}

export interface AgentMetadata {
    id: string;
    displayName: string;
    type: AgentType;
    arguments: Array<string>;
    api?: Array<ApiMethodInfo>;
    dataPoints: Array<DataPoint>;
}

export interface DataPoint {
    id: string;
    displayName: string;
    dataType: string | number | boolean | Date;
}

export type RuleResultValue = boolean | number;

export interface AgentTask {
    token: {
        auth: string;
    };
    target: {
        ruleId: string;
        agentId: string;
        result: RuleResultValue;
        actions: Array<Action>;
    };
}

export interface Action {
    id?: string;
    type: string;
    params: Array<Parameter>;
}

export interface Parameter {
    key: string;
    value: string | number | boolean;
}
