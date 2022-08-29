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

import {
  Agent,
  AgentMetadata,
  AgentParameters,
  OperationResult,
} from './common';
import { User } from './user';

export interface TargetEntity {
  type: string;
  name: string;
  parameters: Record<string, string>;
}

export interface TargetEntityMetadata {
  key: string;
  name: string;
  parameters?: string[];
}

export interface TargetAgent extends Agent {
  /**
   * Executes a set of tasks that result from rule evaluations
   * @param {TargetAgentTask[]} tasks the tasks to execute
   */
  executeTasks(tasks: TargetAgentTask[]): Promise<OperationResult[]>;

  /**
   * @inheritdoc
   */
  describe(): Promise<TargetAgentMetadata>;

  /**
   * List a set of target entities this agent can interact with.
   * @param {string} type the entity type
   * @param {AgentParameters} parameters the call parameters
   * @param {User} requestor the requesting user
   * @param {Record<string, string>} requestorSettings the requestor's user
   *    settings.
   * @returns {Promise<TargetEntityResponse>} the agent's response
   */
  listTargetEntities(
    type: string,
    parameters: AgentParameters,
    requestor: User,
    requestorSettings: Record<string, string>
  ): Promise<TargetEntityResponse>;
}

export interface TargetAgentMetadata extends AgentMetadata {
  targetEntities: TargetEntityMetadata[];
}

export type TargetAgentAction = 'ACTIVATE' | 'DEACTIVATE';

export interface TargetAgentTask {
  agentId: string;
  action: TargetAgentAction;
  parameters: AgentParameters;
  owner: User;
  ownerSettings: Record<string, string>;
}

export interface TargetEntityResponse extends OperationResult {
  entities?: TargetEntity[];
}
