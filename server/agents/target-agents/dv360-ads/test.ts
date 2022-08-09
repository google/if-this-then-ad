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

import { DV360Agent } from './dv360-agent'; './dv360-agent';
import { AgentTask } from './interfaces';

const task: AgentTask = {
  token: {
    auth: '',
  },
  target: {
    ruleId: '123',
    agentId: 'DV360',
    result: false,
    actions: [
      {
        type: 'activate',
        params: [
          {
            key: 'entityId',
            value: 50389587,
          },
          {
            key: 'parentId',
            value: 4304640,
          },
          {
            key: 'entityType',
            value: 'lineItem',
          },
        ],
      },
      {
        type: 'pause',
        params: [
          {
            key: 'entityId',
            value: 1231250389587, // non-existing id
          },
          {
            key: 'parentId',
            value: 4304640,
          },
          {
            key: 'entityType',
            value: 'lineItem',
          },
        ],
      },
      {
        type: 'pause',
        params: [
          {
            key: 'entityId',
            value: 19345182,
          },
          {
            key: 'parentId',
            value: 4304640,
          },
          {
            key: 'entityType',
            value: 'insertionOrder',
          },
        ],
      },
    ],
  },
};

new DV360Agent().execute(task).then((x) => console.log(x));
