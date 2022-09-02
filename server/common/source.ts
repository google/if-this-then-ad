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

/**
 * A description of a parameter a source agent requires to make calls
 * to the ultimate API.
 */
export interface SourceAgentParameterMetadata {
  /** The parameter's human readable name. */
  name: string;
  /** The parameter's unique key. */
  key: string;
  /** The type of the parameter. */
  type: string;
  /** Optional enumeration values. */
  values?: string[];
}

/**
 * A description of a data point provided by a source agent.
 *
 * Source agent can provide data point values as strings, numbers or booleans.
 *
 * Numeric data points should also specify the unit of measurement if applicable.
 * E.g. temperature data points should specify whether they are in °C, °F or K.
 *
 * Enumeration values may be specified via the values property.
 * E.g. index data points should specify possible values like 'low', 'medium',
 * 'high', etc.
 */
export interface SourceAgentDataPointMetadata {
  /** The data point's unique key. */
  key: string;
  /** The data point's human readable name. */
  name: string;
  /** The type of the data point. */
  type: 'string' | 'number' | 'boolean';
  /** Optional enumeration values. */
  values?: string[];
}

/**
 * A description of an agent and it's capabilities.
 */
export interface SourceAgentMetadata extends AgentMetadata {
  /**
   * Parameters which a source agent requires to fetch data.
   */
  readonly parameters: SourceAgentParameterMetadata[];
  /**
   * Data points which a source agent provides.
   */
  readonly dataPoints: SourceAgentDataPointMetadata[];
}

/**
 * A query task for the source agent to execute.
 */
export interface SourceAgentTask {
  /**
   * Parameters for this task.
   */
  parameters: AgentParameters;

  /**
   * The ID of the user who owns this task.
   */
  ownerId: string;

  /**
   * The task owners settings object.
   */
  ownerSettings: Record<string, string>;
  /**
   * The data points for which this task requires data.
   */
  dataPoints: string[];
}

/**
 * The source agent's response data object. When executing tasks, the
 * source agent must respons with an object that contains values for each
 * queried data point.
 *
 * If a task's data points contain ["a", "b", "c"] the source agent must provide
 * a response object in the form of { "a": <value>, "b": <value>, "c": <value>},
 * where values must be of the type specified by the data point description.
 */
export interface SourceAgentData {
  [dataPoint: string]: number | boolean | string;
}

/**
 * The result of a data fetching job. The data object must contain values for
 * each queried data point. The data can be undefined in error cases (i.e. if
 * the result's status is 'failed' rather than 'success'.)
 */
export interface SourceAgentTaskResult extends OperationResult {
  /** The agent's response data. */
  data?: SourceAgentData;
}

/**
 * The source agent is responsible for fetching data from a source.
 *
 * Source agents access an external API to request input signals and translate
 * those signals into data for the rule engine. The process of fetching data
 * is asynchronous and source agent implementations will be invoked via tasks.
 *
 * A source agent task encapsulates the query for a set of data points. Source
 * agents must provide data for all queried data points. Tasks will also
 * receive a set of parameters for the query and the task owner's settings.
 * Source agents should inspect parameters and owner settings to draw required
 * values for the ultimate API query.
 *
 * In addition to the process of executing tasks, source agents must also
 * implement the method "describe", which provides metadata for the agent,
 * including the agent's name and ID, which data points this source agent
 * provides, etc. Please refer to the SourceAgentDescription interface for
 * information on descriptive metadat.
 */
export interface SourceAgent extends Agent {
  /**
   * Executes a query task.
   * @param task the task to be executed
   */
  executeTask(task: SourceAgentTask): Promise<SourceAgentTaskResult>;

  /**
   * Provides descriptive metadata about this agent, including its name, id and
   * available source data points .
   */
  describe(): Promise<SourceAgentMetadata>;
}
