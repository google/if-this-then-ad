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
