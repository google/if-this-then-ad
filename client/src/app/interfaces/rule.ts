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

import { AgentParameters, Model, OperationResult } from './common';
import { TargetAgentAction } from './target';

export type Comparator = 'eq' | 'gt' | 'lt';

/**
 * A rule's condition definition
 */
export interface Condition {
  /** The source data point to compare. */
  dataPoint: string;
  /** The condition's comparator. */
  comparator: Comparator;
  /** The value to compare against. */
  compareValue: string | number | boolean;
}

/**
 * A rule's source definition.
 */
export interface RuleSourceAction {
  /** The source agent ID. */
  agentId: string;
  /** The source agent parameters. */
  parameters: AgentParameters;
}

/**
 * A rule's target definition.
 */
export interface RuleTargetAction {
  /** The target agent ID. */
  agentId: string;
  /** The target agent parameters. */
  parameters: AgentParameters;
  /** The action to execute if the condition evaluates to true. */
  action: TargetAgentAction;
}

export interface RuleStatus {
  /** A flag indicating that the rule evaluation succeeded. */
  success: boolean;
  /** The rule's last evaluation date. */
  lastExecution: Date;
  /** The reason the rule evaluation did not succeed. */
  error?: string;
}

/**
 * The rule definition.
 */
export interface Rule extends Model {
  /** The rule's human-readable name */
  name: string;
  /** The user ID of the rule owner. */
  ownerId: string;
  /** The execution interval in minutes. */
  executionInterval: number;
  /** The rule's source definition. */
  source: RuleSourceAction;
  /** The rule's condition definition. */
  condition: Condition;
  /** The rule's target defintion. */
  targets: RuleTargetAction[];

  /** The status of the rule's last evaluation. */
  latestStatus?: RuleStatus;
}

/**
 * The result of evaluating a rule.
 *
 * During evaluation source agent data is translated to the resulting
 * actions for the target agent.
 */
export interface RuleEvaluationResult extends OperationResult {
  /** The rule which was evaluated */
  rule: Rule;
  /** The resulting target actions after evaluation. */
  targetActions?: RuleTargetAction[];
}
