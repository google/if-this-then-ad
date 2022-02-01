export interface AgentResponse {
    jobId: string,
    data: any
}

export interface IAgent {
    agentId: string,
    name: string,
    execute(job:Job):Promise<AgentResult>
}

export enum DV360EntityType {
    'LI' = 'Line Item',
    'IO' = 'Insertion Order'
}

export interface DV360Entity {
    id: number,
    advertiserId: number,
    type: DV360EntityType,
}

export interface Configuration {
    id: string,
    name: string,
    baseUrl: string,
    apiVersion: string,
    jobId?:string,
	authToken?: string,
    targetEntity?: DV360Entity,
    action?: any,
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

export interface Job {
    id: string,
    agentId: string,
    query?: {
        dataPoint: string,
        value: string | number | boolean
    },
    update?: {
        key: string,
        value: any
    }[],
}
