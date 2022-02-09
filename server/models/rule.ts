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

export enum CONDITIONS {
    equals = 'eq',
    greater = 'gt',
    less = 'lt',
}

export interface RuleDefinition {
    id?: string;
    jobId?: string;
    agent: Agent;
    rule: Rule;
    targets?: Array<TargetAgent>;
}
export interface Rule {
    name: string;
    interval: number;
    datapoint: string;
    condition: CONDITIONS.equals | CONDITIONS.greater | CONDITIONS.less;
    targetValue: string | number | boolean;
}

export interface Agent {
    id: string;
    params: {
        dataPoint: string;
        value: string | number | boolean;
    };
}
export interface RuleResult {
    ruleId: string;
    result: boolean | number;
    target: Array<TargetAgent>;
}

interface actionParam {
    param: string;
    value: string | number | boolean;
}
interface TargetActions {
    action: string;
    actionParams: Array<actionParam>;
}

export interface TargetAgent {
    agentId: string;
    ruleResult?: RuleResult;
    actions: Array<TargetActions>;
}
