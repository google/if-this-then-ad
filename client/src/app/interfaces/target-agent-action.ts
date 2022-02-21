export interface TargetAgentActionParam {
  key: string;
  value: string | number | boolean | undefined;
}

export interface TargetAgentAction {
  type: string;
  params: TargetAgentActionParam[];
}
