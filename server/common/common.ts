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
 * Base interface of all IFTTA DB models.
 */
export interface Model {
  id: string;
}

/**
 * A model's data (excluding the ID).
 */
export type ModelSpec<T extends Model> = Omit<T, 'id'>;

export interface OperationResult {
  status: 'success' | 'failed';
  error?: string;
}

/**
 * Represents the scheduled fetching of data via a source agent.
 */
export interface Job extends Model {
  ownerId: string;
  executionInterval: number;
  lastExecutionDate?: Date;
  sourceAgentId: string;
  sourceParameters: AgentParameters;
  ruleIds: string[];
}

export type AgentParameters = Record<string, string>;

export interface Agent {
  /** The unique ID of this agent. */
  readonly id: string;

  /**
   * Provides descriptive metadata about this agent, including its name, id and
   * additional capabilities.
   */
  describe(): Promise<AgentDescription>;
}

export interface AgentSettingDescription {
  key: string;
  name: string;
}
export interface AgentDescription {
  id: string;
  name: string;
  type: 'source' | 'target';
  settings?: AgentSettingDescription[];
}
