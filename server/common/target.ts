import {
  Agent,
  AgentDescription,
  AgentParameters,
  OperationResult,
} from './common';
import { User } from './user';

export interface TargetEntity {
  type: string;
  name: string;
  parameters: Record<string, string>;
}

export interface TargetEntityDescription {
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
  describe(): Promise<TargetAgentDescription>;

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

export interface TargetAgentDescription extends AgentDescription {
  targetEntities: TargetEntityDescription[];
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
