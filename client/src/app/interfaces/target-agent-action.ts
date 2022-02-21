export interface TargetAgentActionParam {
  key: string;
  value: string | number | boolean;
}

export interface TargetAgentAction {
  type: string;
  params: TargetAgentActionParam[];
}
