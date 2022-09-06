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

import axios, { AxiosResponse } from 'axios';
import {
  SourceAgent,
  SourceAgentData,
  SourceAgentMetadata,
  SourceAgentTask,
  SourceAgentTaskResult,
} from 'common/source';
import { createHash } from 'crypto';
import { logger } from '../../util/logger';

/**
 * A very simple base implementation of a source agent.
 *
 * Extending classes must call the super constructor and implement the fetch
 * method.
 */
export abstract class SimpleSourceAgent implements SourceAgent {
  /**
   * @inheritdoc
   */
  readonly id: string;
  protected cache: Record<string, AxiosResponse<any, any>>;

  /**
   * A logger object this source agent can use to log information about the
   * query process.
   */
  protected logger = logger;

  /** This agent's support data point names. */
  private supportedDataPoints: Set<string>;

  /**
   * Implementing classes must implement this function to respond to a single
   * data point query.
   *
   * If an external API responds with a composite answer of multiple data points
   * no matter which data point is being queried, the fetch method may
   * pre-emptively return additional data point values to reduce the number of
   * API requests.
   *
   * @param {string} dataPoint the data point being queried
   * @param {Record<string, unknown>} parameters the parameters for this data
   *    point query
   * @param {Record<string, string>} ownerSettings the task owner's settings
   *    object
   */
  protected abstract fetch(
    dataPoint: string,
    parameters: Record<string, unknown>,
    ownerSettings: Record<string, string>
  ): Promise<SourceAgentData>;

  /**
   * Constructor
   * @param {SourceAgentMetadata} description the source agent description
   *    for this agent
   */
  constructor(private readonly description: SourceAgentMetadata) {
    this.id = description.id;
    this.supportedDataPoints = new Set(
      description.dataPoints.map((dataPoint) => dataPoint.key)
    );
    this.cache = {};
  }

  /**
   * Execute HTTP request.
   *
   * @param {string} url
   * @param {Object} params
   * @param {AxiosRequestHeaders} headers
   * @returns {Promise<AxiosResponse<T, any>>}
   */
  async executeHttpRequest<T>(url: string, params = {}, headers = {}) {
    // Calculate cache key
    const cacheKey = createHash('md5')
      .update(`${url}.${JSON.stringify(params)}`)
      .digest('hex');

    // Check if request is cached
    if (cacheKey in this.cache) {
      this.logger.info(`Returning cached result!`);
      return this.cache[cacheKey];
    }

    // Execute request
    const res = await axios.get<T>(url, {
      headers,
      params,
    });

    // Store response in cache
    this.cache[cacheKey] = res;

    return res;
  }

  /**
   * @inheritdoc
   */
  async executeTask(task: SourceAgentTask): Promise<SourceAgentTaskResult> {
    const responseData: SourceAgentData = {};

    const dataPoints = task.dataPoints;
    for (const dataPoint of dataPoints) {
      if (!this.supportedDataPoints.has(dataPoint)) {
        return {
          status: 'failed',
          error: `Data point ${dataPoint} is not available in agent ${this.id}`,
        };
      }

      if (dataPoint in responseData) {
        // already fetched this piece of data
        continue;
      }
      try {
        const dataPoints = await this.fetch(
          dataPoint,
          task.parameters,
          task.ownerSettings
        );
        Object.entries(dataPoints).forEach(
          ([dataPoint, value]) => (responseData[dataPoint] = value)
        );
      } catch (err) {
        this.logger.error(err);

        return {
          status: 'failed',
          error:
            err instanceof Error
              ? err.message
              : `Fetching data point ${dataPoint} failed.`,
        };
      }
    }
    return { status: 'success', data: responseData };
  }

  /**
   * @inheritdoc
   */
  describe() {
    return Promise.resolve(this.description);
  }
}
