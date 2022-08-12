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
  name: string;
  settingName: string;
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
  ownerSettings?: Record<string, string>;
}

export enum AgentType {
  SOURCE = 'source-agent',
  TARGET = 'target-agent',
}

export interface ApiCallParams {
  url: string;
  params?: object;
  data?: object;
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
  operations: AdGroupOperation[];
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
