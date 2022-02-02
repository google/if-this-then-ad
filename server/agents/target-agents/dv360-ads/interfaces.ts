export interface AgentResponse {
    jobId: string,
    data: any
}

export interface IAgent {
    agentId: string,
    name: string,
    execute(actions: TargetAction):Promise<AgentResult>
}

export enum DV360EntityType {
    LI = 'Line Item',
    IO = 'Insertion Order'
}

export interface Configuration {
    id: string,
    name: string,
    baseUrl: string,
    apiVersion: string,
    jobId?:string,
	authToken?: string,
    action?: any,
    entityId?: number,
    entityAdvertiserId?: number,
    entityType?: DV360EntityType,
}

export interface AgentResult  {
    agentId: string,
    jobId: string,
    agentName: string,
    timestamp: Date,
    success: boolean,
}

export interface AgentMetadata {
    agentId: string, 
    agentName: string,
    agentType: AgentType,
    queryable: Array<string>, 
    dataPoints: Array<DataPoint>
}

export interface DataPoint {
    name: string, 
    displayName: string, 
    dataType: string|number|boolean|Date
}

export enum AgentType {
    SOURCE = "source-agent", 
    TARGET = "target-agent"
}

export interface actionParam {
    key: string,
    value: string | number | boolean
}

export interface TargetAction {
    action: string,
    params: Array<actionParam>
}
