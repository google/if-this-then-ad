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

import { AgentResult, COMPARATORS, Rule } from './interfaces';

export const PollenTestRule: Rule = {
  condition: {
    comparator: COMPARATORS.equals,
    dataPoint: 'pollenRiskLevel',
    dataType: 'enum',
    name: 'pollen-level',
    value: 'Moderate',
  },
  executionInterval: 60,
  name: 'polen-test-1',
  source: {
    id: 'ambee',
    name: 'Ambee',
  },
  targets: [],
  id: 'idvalue',
  owner: 'owner',
  jobId: 'jobId',
};

export const HazardousAirRule: Rule = {
  condition: {
    comparator: COMPARATORS.equals,
    dataPoint: 'airQualityLevel',
    dataType: 'enum',
    name: 'air-quality',
    value: 'Hazardous',
  },
  executionInterval: 60,
  name: 'polen-test-1',
  source: {
    id: 'ambee',
    name: 'Ambee',
  },
  targets: [],
  id: 'idvalue',
  owner: 'owner',
  jobId: 'jobId',
};

export const PollenAgentResult: AgentResult = {
  agentId: 'ambee',
  jobId: 'jobid',
  agentName: 'ambee-agent',
  data: {
    targetLocation: 'Hamburg',
    pollenRiskLevel: 'Moderate',
    airQualityLevel: 'Hazardous',
  },
  timestamp: new Date(Date.parse('2022-01-28T15:05:26.715Z')),
};
