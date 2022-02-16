import { SourceAgentSettingsParam } from "./source-agent-settings-parameter";

export interface SourceAgentSettings {
  agentId: string;
  params: SourceAgentSettingsParam[];
}