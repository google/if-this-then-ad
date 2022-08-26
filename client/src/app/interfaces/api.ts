import { SourceAgentDescription } from './source';
import { TargetAgentDescription } from './target';

export interface AgentsDescription {
  source: SourceAgentDescription[];
  target: TargetAgentDescription[];
}
