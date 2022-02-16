import { DataPoint } from 'src/app/interfaces/datapoint'
import { SourceAgentParameter } from './source-agent-parameter';
import { SourceAgentSettings } from './source-agent-settings';

export interface SourceAgent {
  id: string;
  name: string;
  type: "source-agent";
  settings: SourceAgentSettings;
  params: SourceAgentParameter[];
  dataPoints: DataPoint[];
}