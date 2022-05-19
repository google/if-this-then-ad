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

export interface AgentParams {
    name: string,
    settingName: string,
}

export interface AgentMetadata {
    id: string;
    name: string;
    type: AgentType;
    arguments: Array<string>;
    api?: Array<ApiMethodInfo>;
    dataPoints: Array<DataPoint>;
    params?: Array<AgentParams>;
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

export interface UserSettingKeyValue {
    [key: string]: string
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
    ownerId?: string;
    ownerSettings?: UserSettingKeyValue;
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

export interface AdGroup {
    customerId: string;
    campaignId: string;
    campaignName: string;
    id: string;
    type: string;
    name: string;
    status: string;
}
export interface MutateOperation {
    operations: AdGroupOperation[]
}
export interface AdGroupOperation {
    updateMask: string;
    create?: AdGroupObject;
    update?: AdGroupObject;
    delete?: AdGroupObject;
}
// TODO define a full AdGroupObject shape 
// based on future requirements
export interface AdGroupObject {
    resourceName: string;
}
export interface AdCampaign {
    customerId: string;
    campaignId: string;
    name: string;
    status: string;
}

export interface InstanceOptions {
    customerAccountId: string;
    managerAccountId: string;
    entityType?: string;
    entityId?: string;
    developerToken: string;
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
