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
require('module-alias/register');
import { RulesProcessor } from '../src/rules-processor';
import { AgentResult, Rule, COMPARATORS } from '../src/interfaces';
import {
  HazardousAirRule,
  PollenAgentResult as ModeratePollenResult,
  PollenTestRule as ModeratePollenRule,
} from './rule.mocks';
describe('Rule evaluation test suite ', () => {
  const rp = new RulesProcessor();

  const agentResult: AgentResult = {
    agentId: 'open-weather-map-agent',
    jobId: '2',
    agentName: 'Weather',
    data: {
      targetLocation: 'Hamburg',
      temperature: 5.78,
      windSpeed: 5.66,
      thunderstorm: false,
      snow: false,
      rain: false,
      clouds: false,
      clearSky: true,
    },
    timestamp: new Date(Date.parse('2022-01-28T15:05:26.715Z')),
  };

  const testRule: Rule = {
    id: '1',
    name: 'clear-skies Hamburg',
    jobId: '2',
    owner: 'YrqYQc15jFYutbMdZNss',
    source: {
      id: 'open-weather-map',
      name: 'open-weather-map',
    },
    condition: {
      name: 'clear-skies Hamburg',
      dataPoint: 'clearSky',
      comparator: COMPARATORS.equals,
      value: true,
    },
    executionInterval: 60,
  };

  it('Should evaluate to True given data point equals the target value', () => {
    const ruleResult = rp.evaluate(testRule, agentResult);
    expect(ruleResult).toBe(true);
  });

  it('Should evaluate to False if temp is below the threshold', () => {
    const warmWeatherRule: Rule = { ...testRule };
    warmWeatherRule.condition.dataPoint = 'temperature';
    warmWeatherRule.condition.comparator = COMPARATORS.greater;
    warmWeatherRule.condition.value = 20.0;

    const ruleResult = rp.evaluate(warmWeatherRule, agentResult);
    expect(ruleResult).toBe(false);
  });

  it('Should evaluate to True if temp is below threshold', () => {
    const coldWeatherRule = { ...testRule };
    coldWeatherRule.condition.dataPoint = 'temperature';
    coldWeatherRule.condition.comparator = COMPARATORS.less;
    coldWeatherRule.condition.value = 10;
    const ruleResult = rp.evaluate(coldWeatherRule, agentResult);
    expect(ruleResult).toBe(true);
  });

  it('Should evaluate to False when passed invalid data point', () => {
    const nonExistingDataPointRule = { ...testRule };
    nonExistingDataPointRule.condition.dataPoint = 'Nonexisting';
    expect(rp.evaluate(nonExistingDataPointRule, agentResult)).toBe(false);
  });

  // it('Should return valid rules for the AgentResult', async () => {
  //     const rulesForAgent = await rp.getValidRulesForAgent(agentResult);
  //     expect(rulesForAgent.length).toBe(2);
  // });

  // it('Should return no rules given invalid AgentResult', async () => {
  //     let invalidAgentResult = Object.create(agentResult);
  //     invalidAgentResult.agentId = 'non-existing-agent';
  //     const rulesForAgent = await rp.getValidRulesForAgent(invalidAgentResult);
  //     expect(rulesForAgent.length).toBe(0);
  // });

  it('Should evaluate to False, if no rain is detected', () => {
    const rainFalseRule = { ...testRule };
    rainFalseRule.condition.dataPoint = 'rain';
    rainFalseRule.condition.comparator = COMPARATORS.equals;
    const ruleResult = rp.evaluate(rainFalseRule, agentResult);
    expect(ruleResult).toBe(false);
  });

  it('Should return True for Moderate Pollen values', () => {
    const ruleResult = rp.evaluate(ModeratePollenRule, ModeratePollenResult);
    expect(ruleResult).toBe(true);
  });

  it('Should evaluate return False for Low Pollen values', () => {
    const lowPollenResult = { ...ModeratePollenResult };
    lowPollenResult.data.pollenRiskLevel = 'Low';
    const ruleResult = rp.evaluate(ModeratePollenRule, lowPollenResult);
    expect(ruleResult).toBe(false);
  });

  it('Should evaluate return True for Hazardous Air quality', () => {
    const hazardousAirResult = { ...ModeratePollenResult }; // contains hazardous air data
    const ruleResult = rp.evaluate(HazardousAirRule, hazardousAirResult);
    expect(ruleResult).toBe(true);
  });

  it('Should evaluate return False when Air quality  is not hazardous', () => {
    const hazardousAirResult = { ...ModeratePollenResult };
    const ruleResult = rp.evaluate(HazardousAirRule, hazardousAirResult);
    expect(ruleResult).toBe(true);
  });
});
