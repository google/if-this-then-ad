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
    enum?: Array<string>;
  } = {};
  targets: TargetAgent[] = [];
  status?: {
    lastExecution: Date;
    success: boolean;
    message?: string;
  };
}
