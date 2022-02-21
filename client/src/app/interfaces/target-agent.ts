import { TargetAgentAction } from './target-agent-action';

export interface TargetAgent {
  agentId: string;
  actions: TargetAgentAction[];
}
