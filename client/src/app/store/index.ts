/**
    Copyright 2022 Google LLC
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        https://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

import { BehaviorSubject, Subject } from 'rxjs';
import { TargetAgent } from '../interfaces/target-agent';
import { TargetAgentAction } from '../interfaces/target-agent-action';

interface SaveRequirements {
  name: boolean;
  source: boolean;
  params: true;
  condition: boolean;
  target: boolean;
  executionInterval: boolean;
}

const targetsCollector = new Map<string, TargetAgentAction[]>();

const saveRequirements: SaveRequirements = {
  name: false,
  source: false,
  params: true,
  condition: false,
  target: false,
  executionInterval: false,
};

export const store = {
  saveRequirements: new BehaviorSubject<SaveRequirements>(saveRequirements),
  sourceSet: new BehaviorSubject<boolean>(false),
  ruleAdded: new Subject<boolean>(),
  targets: new Subject<TargetAgent[]>(),
  sidenav: new Subject<boolean>(),
  addTarget: (_targetAgent: TargetAgent) => {
    targetsCollector.set(_targetAgent.agentId, _targetAgent.actions);
    const targets: TargetAgent[] = [];
    for (const k of targetsCollector.keys()) {
      targets.push({ agentId: k, actions: targetsCollector.get(k)! });
    }
    store.targets.next(targets);
  },
};
