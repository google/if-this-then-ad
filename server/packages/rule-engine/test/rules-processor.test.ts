import { RulesProcessor } from '../src/rules-processor';
import { AgentResult, Rule, CONDITIONS } from '../src/interfaces';

describe("test add ", () => {
    const rp = new RulesProcessor();

    const agentResult: AgentResult = {
        agentId: 'open-weather-map-agent',
        jobId: '2',
        agentName: 'Weather',
        targetLocation: 'Hamburg',
        temperature: 5.78,
        windSpeed: 5.66,
        thunderstorm: false,
        snow: false,
        rain: false,
        clouds: false,
        clearSky: true,
        timestamp: new Date(Date.parse('2022-01-28T15:05:26.715Z'))
    }

    const testRule: Rule = {
        ruleId: '1',
        jobId: '2',
        agentName: 'open-weather-map-agent',
        agentId: 'open-weather-map-agent',
        ruleName: 'clear-skies Hamburg',
        ruleDatapoint: 'clearSky',
        ruleCondition: CONDITIONS.equals,
        ruleTargetValue: true
    }

    let warmWeatherRule = Object.create(testRule);
    warmWeatherRule.ruleDatapoint = 'temperature';
    warmWeatherRule.ruleCondition = CONDITIONS.greater;
    warmWeatherRule.ruleTargetValue = 20.0;

    let coldWeatherRule = Object.create(warmWeatherRule);
    coldWeatherRule.ruleCondition = CONDITIONS.less;
    coldWeatherRule.ruleTargetValue = 10;

    let nonExistingDataPointRule = Object.create(coldWeatherRule);
    nonExistingDataPointRule.ruleDatapoint = 'Nonexisting';

    it("Should evaluate to True given data point equals the target value", () => {
        const ruleResult = rp.evaluate(testRule, agentResult);
        expect(ruleResult).toBe(true);
    });

    it("Should evaluate to False if temp is not above the threshold", () => {
        const ruleResult = rp.evaluate(warmWeatherRule, agentResult);
        expect(ruleResult).toBe(false);
    });

    it("Should evaluate to True if temp is below threshold", () => {
        const ruleResult = rp.evaluate(coldWeatherRule, agentResult);
        expect(ruleResult).toBe(true);
    });

    it("Should evaluate to False when passed invalid data point", () => {
        expect(rp.evaluate(nonExistingDataPointRule, agentResult)).toBe(false);
    });

    it('Should return valid rules for the AgentResult', () => {
        
        const rulesForAgent = rp.getValidRulesForAgent(agentResult);
        expect(rulesForAgent.length).toBe(2);
    });

    it('Should return no rules given invalid AgentResult', () => {
        let invalidAgentResult = Object.create(agentResult); 
        invalidAgentResult.agentId = 'non-existing-agent';
        const rulesForAgent = rp.getValidRulesForAgent(invalidAgentResult);
        expect(rulesForAgent.length).toBe(0);
    });

}); 