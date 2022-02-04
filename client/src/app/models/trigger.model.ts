import { SourceAgentArgument } from "../interfaces/source-agent-argument";
import { TargetAgent } from "../interfaces/target-agent";

export class Trigger {
  agent: {
    id?: string,
    params?: SourceAgentArgument[],
  } = {};
  rule: {
    name?: string,
    dataPoint?: string,
    dataType?: string,
    condition?: string,
    value?: string|number,
    interval?: number,
  } = {};
  targets: TargetAgent[] = [];
}
