export interface Action {
    id?: string;
    type: string;
    params: Array<Parameter>;
}

export interface ActionParam {
    key: string;
    value: string | number | boolean;
}

export interface ActionResult {
    ruleId: string;
    agentId: string;
    displayName?: string;
    entityStatus?: EntityStatus;
    timestamp: Date;
    success: boolean;
    error?: string;
}

export interface AgentMetadata {
    id: string;
    displayName: string;
    type: AgentType;
    arguments: Array<string>;
    api?: Array<ApiMethodInfo>;
    dataPoints: Array<DataPoint>;
}

export interface AgentOptions {
    key: string;
    value: string | number | boolean;
}

export interface AgentResult {
    agentId: string;
    jobId: string;
    agentName: string;
    timestamp: Date;
    success: boolean;
}

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

export enum AgentType {
    SOURCE = 'source-agent',
    TARGET = 'target-agent',
}

export interface ApiCallParams {
    url: string;
    params?: Object;
    data?: Object;
    method?: HttpMethods;
}

export interface ApiMethodInfo {
    dataPoint: string;
    list: ApiCallParams;
}

export interface DataPoint {
    id: string;
    name: string;
    dataType: string | number | boolean | Date;
}

export enum EntityActions {
    ACTIVATE = 'activate',
    PAUSE = 'pause',
}

export enum EntityStatus {
    ACTIVE = 'ENABLED',
    PAUSED = 'PAUSED',
}

export enum EntityType {
    adGroup = 'adGroup',
    campaign = 'campaign',
}

export interface GoogleAdsApiClientOptions {
    authToken: string;
    baseUrl: string;
}

export enum HttpMethods {
    POST = 'POST',
    GET = 'GET',
}

export interface IAgent {
    agentId: string;
    name: string;
    execute(task: AgentTask): Promise<Array<ActionResult>>;
    getAgentMetadata(): Promise<AgentMetadata>;
}

export interface InstanceOptions {
    externalCustomerId: string;
    externalManagerCustomerId: string;
    entityType?: string;
    entityId?: string;
    developerToken: string;
}

export interface ListRecord {
    externalCustomerId: string,
    campaignId: string,
    adGroupId?: string,
    name: string,
    status: string
}

export interface Parameter {
    key: string;
    value: string | number | boolean;
}

export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    actions: Array<TargetAction>;
}

export type RuleResultValue = boolean | number;

export interface TargetAction {
    action: string;
    params: Array<ActionParam>;
}

export interface TargetAgent {
    id: string;
    actions: Array<TargetAction>;
}
