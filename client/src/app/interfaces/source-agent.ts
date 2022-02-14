import { DataPoint } from 'src/app/interfaces/datapoint'
import { SourceAgentParameter } from './source-agent-parameter';

export interface SourceAgent {
  id: string;
  name: string;
  type: "source-agent";
  params: SourceAgentParameter[];
  dataPoints: DataPoint[];
};