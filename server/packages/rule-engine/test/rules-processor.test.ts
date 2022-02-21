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

import { RulesProcessor } from '../src/rules-processor';
import { AgentResult, Rule, COMPARATORS } from '../src/interfaces';

describe('test add ', () => {
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

    const warmWeatherRule = Object.create(testRule);
    warmWeatherRule.ruleDatapoint = 'temperature';
    warmWeatherRule.ruleCondition = COMPARATORS.greater;
    warmWeatherRule.ruleTargetValue = 20.0;

    const coldWeatherRule = Object.create(warmWeatherRule);
    coldWeatherRule.ruleCondition = COMPARATORS.less;
    coldWeatherRule.ruleTargetValue = 10;

    const nonExistingDataPointRule = Object.create(coldWeatherRule);
    nonExistingDataPointRule.ruleDatapoint = 'Nonexisting';

    it('Should evaluate to True given data point equals the target value', () => {
        const ruleResult = rp.evaluate(testRule, agentResult);
        expect(ruleResult).toBe(true);
    });

    it('Should evaluate to False if temp is not above the threshold', () => {
        const ruleResult = rp.evaluate(warmWeatherRule, agentResult);
        expect(ruleResult).toBe(false);
    });

    it('Should evaluate to True if temp is below threshold', () => {
        const ruleResult = rp.evaluate(coldWeatherRule, agentResult);
        expect(ruleResult).toBe(true);
    });

    it('Should evaluate to False when passed invalid data point', () => {
        expect(rp.evaluate(nonExistingDataPointRule, agentResult)).toBe(false);
    });

    it('Should return valid rules for the AgentResult', async () => {
        const rulesForAgent = await rp.getValidRulesForAgent(agentResult);
        expect(rulesForAgent.length).toBe(2);
    });

    it('Should return no rules given invalid AgentResult', async () => {
        let invalidAgentResult = Object.create(agentResult);
        invalidAgentResult.agentId = 'non-existing-agent';
        const rulesForAgent = await rp.getValidRulesForAgent(invalidAgentResult);
        expect(rulesForAgent.length).toBe(0);
    });
});
