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

export interface AgentResult {
    agentId: string;
    jobId: string;
    agentName: string;
    data: any;
    timestamp: Date;
}

export enum COMPARATORS {
    equals = 'eq',
    greater = 'gt',
    less = 'lt',
    yes = 'yes',
    no = 'no',
}

export interface Rule {
    id: string;
    name: string;
    owner: string;
    source: {
        id: string;
        name: string;
    };
    condition: {
        name: string;
        dataPoint: string;
        comparator:
            | COMPARATORS.equals
            | COMPARATORS.greater
            | COMPARATORS.less
            | COMPARATORS.yes
            | COMPARATORS.no;
        value: string | number | boolean;
    };
    executionInterval: number;
    jobId: string;
    targets?: Array<TargetAgent>;
}

export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    targets: Array<TargetAgent>;
}

interface Parameter {
    key: string;
    value: string | number | boolean;
}

interface Action {
    id?: string;
    type: string;
    params: Array<Parameter>;
}

export interface TargetAgent {
    agentId: string;
    actions: Array<Action>;
}
