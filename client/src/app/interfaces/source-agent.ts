import { DataPoint } from 'src/app/interfaces/datapoint'
import { SourceAgentArgument } from './source-agent-argument';

export interface SourceAgent {
  id: string;
  displayName: string;
  type: "source-agent";
  arguments: SourceAgentArgument[];
  dataPoints: DataPoint[];
}