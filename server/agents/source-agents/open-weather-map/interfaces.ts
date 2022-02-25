/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

export interface AgentResponse {
    jobId: string;
    jobOwner: string;
    data: any;
}

export interface IAgent {
    agentId: string;
    name: string;
    execute(job: Job): Promise<AgentResult>;
}

export interface Configuration {
    baseUrl: string;
    apiKey: string;
    units: string;
    id: string;
    name: string;
    targetLocation?: string;
    jobId?: string;
    jobOwner: string;
}

export interface AgentResult {
    agentId: string;
    jobId: string;
    jobOwner: string;
    agentName: string;
    data: any;
    timestamp: Date;
}

export interface AgentParam {
    dataPoint: string;
    name: string;
    type: string;
}

export interface AgentMetadata {
    id: string;
    name: string;
    type: AgentType;
    settings: {
        agentId: string;
        params: [
            {
                key: string;
                name: string;
                type: string;
                value?: string | number | boolean;
            },
        ];
    };
    params: Array<AgentParam>;
    dataPoints: Array<DataPoint>;
}

export interface DataPoint {
    dataPoint: string;
    name: string;
    dataType: string | number | boolean | Date;
}

export const WeatherCodes = {
    THUNDERSTORM: new Set([200, 201, 202, 210, 211, 212, 221, 230, 231, 232]),
    DRIZZLE: new Set([300, 301, 302, 310, 311, 312, 313, 314, 321]),
    RAIN: new Set([500, 501, 502, 503, 504, 511, 520, 521, 522, 531]),
    SNOW: new Set([600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622]),
    CLOUDS: new Set([802, 803, 804]),
    CLEAR: new Set([800, 801]),
};

export enum AgentType {
    SOURCE = 'source-agent',
    TARGET = 'target-agent',
}

export interface Job {
    id?: string;
    agentId: string;
    owner: string;
    executionInterval: number;
    lastExecution?: Date | number;
    ownerSettings?: Setting;
    query?: {
        dataPoint: string;
        value: string | number | boolean;
    };
    rules: Array<string>;
}

export interface Setting {
    agentId: string;
    params: Array<Parameter>;
}

interface Parameter {
    key: string;
    value: string | number | boolean;
}
