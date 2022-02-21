import { SourceAgentParameter } from '../interfaces/source-agent-parameter';
import { TargetAgent } from '../interfaces/target-agent';

/**
 * Rule class.
 */
export class Rule {
  id?: string;
  name?: string;
  owner?: string;
  executionInterval?: number;
  source: {
    id?: string;
    name?: string;
    params: SourceAgentParameter[];
  } = {
    params: [],
  };
  condition: {
    name?: string;
    dataPoint?: string;
    dataType?: string;
    comparator?: string;
    value?: string | number;
  } = {};
  targets: TargetAgent[] = [];
}
