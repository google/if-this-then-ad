import { AgentResult, Rule, CONDITIONS, RuleResult } from '../src/interfaces'
import log from '../../../util/logger';

export class RulesProcessor {

    public async processAgentResult(result: AgentResult): Promise<Array<RuleResult>> {

        const rules = await this.getValidRulesForAgent(result);
        // to return RuleEvaluation[] to be passed to target-agents
        return await this.evaluateRulesAgainstResult(rules, result);
    }

    // get rules matching the agentId from firestore 
    public getValidRulesForAgent(jobResult: AgentResult): Array<Rule> {
        // mock rules 
        const rule1: Rule = {
            ruleId: '1',
            jobId: '2',
            agentId: 'open-weather-map-agent',
            agentName: 'open-weather-map-agent',
            ruleName: 'clear-skies Hamburg',
            ruleDatapoint: 'clearSky',
            ruleCondition: CONDITIONS.equals,
            ruleTargetValue: true
        }

        let rule2: Rule = Object.create(rule1);
        rule2.ruleId = '2',
            rule2.jobId = '1';

        let rule3: Rule = Object.create(rule1);
        rule3.agentId = 'youtube-agent'
        rule3.jobId = '3'


        const rules: Array<Rule> = [rule1, rule2, rule3];

        const rulesForJob = rules.filter((rule) => {
            return rule.agentId == jobResult.agentId;
        })

        return rulesForJob;
    }

    /**
     * Evaluates each rule against the results coming in from the 
     * source agent, and returns a RuleEvaluation Object.
     * @param rules {Array<Rule>}
     * @param result {AgentResult}
     */
    public evaluateRulesAgainstResult(rules: Array<Rule>, result: AgentResult): Array<RuleResult> {
        // outcome here should be ruleResult[] so that we can action on 
        // the evalations of the result in the next step. 
        let ruleResults: Array<RuleResult> = [];
        rules.map(rule => {
            const evalResult = this.evaluate(rule, result);
            const ruleResult: RuleResult = {
                ruleId: rule.ruleId,
                result: evalResult,
                target: rule.targets || [] // ensure that targets are configured. 
            }
            ruleResults.push(ruleResult)
        });
        return ruleResults;
    }

    // go through each rule
    public evaluate(rule: Rule, jobResult: AgentResult): boolean {
        const dpResult = jobResult[rule.ruleDatapoint];

        if (typeof dpResult == 'undefined') {
            const msg = `Datapoint ${rule.ruleDatapoint} is not a valid property of AgentResult`;
            console.log(msg);
            return false;
        }

        if (rule.ruleCondition == CONDITIONS.equals) {
            return dpResult == rule.ruleTargetValue;
        }

        if (rule.ruleCondition == CONDITIONS.greater) {
            return dpResult > rule.ruleTargetValue;
        }

        if (rule.ruleCondition == CONDITIONS.less) {
            return dpResult < rule.ruleTargetValue;
        }
        return false;
    }
}