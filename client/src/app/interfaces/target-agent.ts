import { TargetAgentActions  } from "./target-agent-actions";

export interface TargetAgent {
  id?: string,
  actions?: TargetAgentActions[],
}