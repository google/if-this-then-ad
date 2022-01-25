export interface AgentResponse {
    data: any
}

export interface IAgent {
    agentId: string,
    name: string,
    execute(options: Configuration):Promise<AgentResult>
}

export interface Configuration {
    baseUrl: string,
    apiKey: string,
    units: string,
    queryLocation: string,
    id: string,
    name: string
}

export interface AgentResult  {
    agentId: string,
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
    dataType: string |number|boolean |Date
}

export const WeatherCodes = {
    'THUNDERSTORM': new Set([200, 201, 202, 210, 211, 212, 221, 230, 231, 232]),
    'DRIZZLE': new Set([300, 301, 302, 310, 311, 312, 313, 314, 321]),
    'RAIN': new Set([500, 501, 502, 503, 504, 511, 520, 521, 522, 531]),
    'SNOW': new Set([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]),
    'CLOUDS': new Set([802, 803, 804]),
    'CLEAR': new Set([800, 801]),
}

export enum AgentType {
    SOURCE = "source-agent", 
    TARGET = "target-agent"
}
