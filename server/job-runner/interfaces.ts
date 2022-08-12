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

/**
 * NOTE: Some interfaces have been duplicated for now
 * TODO: Clean up later.
 */

export interface Job {
  id?: string;
  agentId: string;
  owner: string;
  executionInterval: number;
  lastExecution?: Date | number;
  ownerSettings?: unknown;
  query?: {
    dataPoint: string;
    value: string | number | boolean;
  };
  rules: Array<string>;
}

export interface setting {
  agentId: string;
  params: Array<parameter>;
}
interface parameter {
  key: string;
  value: string | number | boolean;
}

export interface ExecutionTime {
  jobId: string;
  lastExecution: Date;
}

export interface AgentTask {
  token: {
    auth: string;
  };
  target: {
    ruleId: string;
    agentId: string;
    result: boolean | number;
    actions: Array<Action>;
  };
  ownerId?: string;
  ownerSettings?: Record<string, string>;
}
export interface AgentResult {
  agentId: string;
  jobId: string;
  jobOwner: string;
  agentName: string;
  data;
  timestamp: Date;
}
export interface RuleResult {
  ruleId: string;
  result: boolean | number;
  targets: Array<TargetAgent>;
}

export interface TargetAgent {
  agentId: string;
  actions: Array<Action>;
}

interface Action {
  id?: string;
  type: string;
  params: Array<Parameter>;
}
interface Parameter {
  key: string;
  value: string | number | boolean;
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
export interface Rule {
  id?: string;
  jobId?: string;
  name: string;
  owner: string;
  source: Agent;
  condition: Condition;
  executionInterval: number;
  targets?: Array<TargetAgent>;
  status?: {
    success: boolean;
    lastExecution: Date;
    message: string;
  };
}

export interface Condition {
  dataPoint: string;
  comparator: COMPARATORS.equals | COMPARATORS.greater | COMPARATORS.less;
  value: string | number | boolean;
}

export interface Agent {
  id: string;
  params: {
    dataPoint: string;
    value: string | number | boolean;
  };
}

export enum COMPARATORS {
  equals = 'eq',
  greater = 'gt',
  less = 'lt',
}
