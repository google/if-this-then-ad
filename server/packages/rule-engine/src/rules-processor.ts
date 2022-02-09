import { AgentResult, Rule, CONDITIONS, RuleResult } from '../src/interfaces';
import Repository from '../../../services/repository-service';
import Collections from '../../../services/collection-factory';
//import { RuleDefinition } from '../../../models/rule'
import { Collection } from '../../../models/fire-store-entity';
import { log } from '@iftta/util';

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<Rule>(rulesCollection);

export class RulesProcessor {
    public async processAgentResult(result: AgentResult): Promise<Array<RuleResult>> {
        const rules = await this.getValidRulesForAgent(result);
        // to return RuleEvaluation[] to be passed to target-agents
        return await this.evaluateRulesAgainstResult(rules, result);
    }

    // get rules matching the agentId from firestore 

    /**
     * Fetch all rules for an agent.
     *
     * @param {AgentResult} jobResult
     * @returns {Promise<Rule[]>}
     */
    public async getValidRulesForAgent(jobResult: AgentResult): Promise<Rule[]> {
        const rules: Rule[] = await repo.list();

        const rulesForJob = rules.filter((rule) => {
            return rule.source.id == jobResult.agentId;
        })

        log.info(`Got ${rulesForJob.length} rules for job ${jobResult.jobId}`);

        return rulesForJob;
    }

    /**
     * Evaluates each rule against the results coming in from the 
     * source agent, and returns a RuleEvaluation Object.
     *
     * @param {Array<Rule>} rules
     * @param {AgentResult} result
     * @returns {Array<RuleResult>}
     */
    public evaluateRulesAgainstResult(rules: Array<Rule>, result: AgentResult): Array<RuleResult> {
        // Outcome here should be ruleResult[] so that we can action on 
        // the evalations of the result in the next step. 
        const ruleResults: Array<RuleResult> = [];
        rules.map(rule => {
            const evalResult = this.evaluate(rule, result);
            const ruleResult: RuleResult = {
                ruleId: rule.id,
                result: evalResult,
                targets: rule.targets || [] // Ensure that targets are configured
            }
            ruleResults.push(ruleResult)
        });

        return ruleResults;
    }

    /**
     * Evaluate rule based on result.
     *
     * @param {Rule} rule
     * @param {AgentResult} jobResult
     * @returns {boolean}
     */
    public evaluate(rule: Rule, jobResult: AgentResult): boolean {
        const dpResult = jobResult[rule.condition.dataPoint];

        if (typeof dpResult == 'undefined') {
            const msg = `Datapoint ${rule.condition.dataPoint} is not a valid property of AgentResult`;
            log.debug(msg);
            return false;
        }

        if (rule.condition.condition == CONDITIONS.equals) {
            return dpResult == rule.condition.value;
        }

        if (rule.condition.condition == CONDITIONS.greater) {
            return dpResult > rule.condition.value;
        }

        if (rule.condition.condition == CONDITIONS.less) {
            return dpResult < rule.condition.value;
        }

        if (rule.condition.condition == CONDITIONS.yes) {
            return !!dpResult;
        }

        if (rule.condition.condition == CONDITIONS.no) {
            return !dpResult;
        }

        return false;
    }
}