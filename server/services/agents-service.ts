import { AmbeeAgent } from '../agents/source-agents/ambee/ambee-agent';
import { OpenWeatherAgent } from '../agents/source-agents/open-weather/open-weather-agent';
import { Dv360Agent } from '../agents/target-agents/dv360-ads/dv360-agent';
import { GoogleAdsAgent } from '../agents/target-agents/google-ads/google-ads-agent';
import { SourceAgent, SourceAgentDescription } from '../common/source';
import { TargetAgent, TargetAgentDescription } from '../common/target';

export interface AgentsDescription {
  /** A list of source agent descriptions */
  source: SourceAgentDescription[];
  /** A list of target agent descriptions */
  target: TargetAgentDescription[];
}

/**
 * Provides agent utilities.
 */
export class AgentService {
  private readonly sourceAgents: Record<string, SourceAgent>;
  private readonly targetAgents: Record<string, TargetAgent>;

  /**
   * Constructor.
   */
  constructor() {
    this.sourceAgents = Object.fromEntries(
      [new AmbeeAgent(), new OpenWeatherAgent()].map((agent) => [
        agent.id,
        agent,
      ])
    );

    this.targetAgents = Object.fromEntries(
      [new Dv360Agent(), new GoogleAdsAgent()].map((agent) => [agent.id, agent])
    );
  }

  /**
   * Provides a description of all available agents.
   * @returns {Promise<AgentsDescription>}
   */
  async describeAll(): Promise<AgentsDescription> {
    const sources = await Promise.all(
      Object.values(this.sourceAgents).map((agent) => agent.describe())
    );
    const targets = await Promise.all(
      Object.values(this.targetAgents).map((agent) => agent.describe())
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
    return this.sourceAgents[id];
  }
  /**
   * Looks up a target agent with the specified ID.
   * @param {string} id the ID of the agent
   * @returns {TargetAgent|undefined} the target agent or undefined if no agent
   *    with the specified ID exists.
   */
  getTargetAgent(id: string): TargetAgent | undefined {
    return this.targetAgents[id];
  }
}

/** The default singleton instance of the agent service. */
export const agentsService = new AgentService();
