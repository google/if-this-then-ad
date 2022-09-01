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

import { AmbeeAgent } from '../agents/source-agents/ambee/ambee-agent';
import { OpenWeatherAgent } from '../agents/source-agents/open-weather/open-weather-agent';
import { Dv360Agent } from '../agents/target-agents/dv360-ads/dv360-agent';
import { GoogleAdsAgent } from '../agents/target-agents/google-ads/google-ads-agent';
import { SourceAgent, SourceAgentMetadata } from '../common/source';
import { TargetAgent, TargetAgentMetadata } from '../common/target';

export interface AgentsMetadata {
  /** A list of source agent descriptions */
  source: SourceAgentMetadata[];
  /** A list of target agent descriptions */
  target: TargetAgentMetadata[];
}

/**
 * Provides agent utilities.
 */
export class AgentService {
  private readonly sourceAgents: Array<SourceAgent>;
  private readonly targetAgents: Array<TargetAgent>;

  /**
   * Constructor.
   */
  constructor() {
    this.sourceAgents = [new AmbeeAgent(), new OpenWeatherAgent()];

    this.targetAgents = [new Dv360Agent(), new GoogleAdsAgent()];
  }

  /**
   * Provides a description of all available agents.
   * @returns {Promise<AgentsMetadata>}
   */
  async describeAll(): Promise<AgentsMetadata> {
    const sources = await Promise.all(
      this.sourceAgents.map((agent) => agent.describe())
    );
    const targets = await Promise.all(
      this.targetAgents.map((agent) => agent.describe())
    );

    return {
      source: sources,
      target: targets,
    };
  }

  /**
   * Looks up a source agent with the specified ID.
   * @param {string} id the ID of the agent
   * @returns {SourceAgent|undefined} the source agent or undefined if no agent
   *    with the specified ID exists.
   */
  getSourceAgent(id: string): SourceAgent | undefined {
    return this.sourceAgents.find((agent) => agent.id === id);
  }

  /**
   * Looks up a target agent with the specified ID.
   * @param {string} id the ID of the agent
   * @returns {TargetAgent|undefined} the target agent or undefined if no agent
   *    with the specified ID exists.
   */
  getTargetAgent(id: string): TargetAgent | undefined {
    return this.targetAgents.find((agent) => agent.id === id);
  }
}

/** The default singleton instance of the agent service. */
export const agentsService = new AgentService();
