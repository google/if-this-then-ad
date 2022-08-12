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

import { AgentResult, Rule, COMPARATORS, RuleResult } from './interfaces';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { logger } from '../util/logger';

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<Rule>(rulesCollection);

/**
 * Rules Processor.
 */
export class RulesProcessor {
  /**
   * Process agent result.
   *
   * @param {AgentResult} result
   * @returns {Promise<Array<RuleResult>>}
   */
  public async processAgentResult(
    result: AgentResult
  ): Promise<Array<RuleResult>> {
    const rules = await this.getValidRulesForAgent(result);
    return this.evaluateRulesAgainstResult(rules, result);
  }

  /**
   * Fetch all rules for an agent.
   *
   * @param {AgentResult} jobResult
   * @returns {Promise<Rule[]>}
   */
  public async getValidRulesForAgent(jobResult: AgentResult): Promise<Rule[]> {
    const rules: Rule[] = await repo.list();

    const rulesForJob = rules.filter((rule) => {
      return (
        rule.source.id == jobResult.agentId && rule.jobId == jobResult.jobId
      );
    });

    logger.info(`Got ${rulesForJob.length} rules for job ${jobResult.jobId}`);

    return rulesForJob;
  }

  /**
   * Evaluate each rule against the results coming in from the
   * source agent, and return a RuleEvaluation Object.
   *
   * @param {Array<Rule>} rules
   * @param {AgentResult} result
   * @returns {Array<RuleResult>}
   */
  public evaluateRulesAgainstResult(
    rules: Array<Rule>,
    result: AgentResult
  ): Array<RuleResult> {
    // Outcome here should be ruleResult[] so that we can action on
    // the evalations of the result in the next step.
    const ruleResults: Array<RuleResult> = [];
    rules.forEach((rule) => {
      const evalResult = this.evaluate(rule, result);
      const ruleResult: RuleResult = {
        ruleId: rule.id,
        result: evalResult,
        targets: rule.targets || [], // Ensure that targets are configured
      };
      ruleResults.push(ruleResult);
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
    const dpResult = jobResult.data[rule.condition.dataPoint];
    if (typeof dpResult == 'undefined') {
      const msg = `Datapoint ${rule.condition.dataPoint} is not a valid property of AgentResult`;
      logger.debug(msg);
      return false;
    }

    if (rule.condition.comparator == COMPARATORS.equals) {
      return (
        dpResult ==
        this.convertToType(rule.condition.value, rule.condition.dataType)
      );
    }

    if (rule.condition.comparator == COMPARATORS.greater) {
      return dpResult > rule.condition.value;
    }

    if (rule.condition.comparator == COMPARATORS.less) {
      return dpResult < rule.condition.value;
    }

    return false;
  }

  /**
   * Make sure a 'boolean' string becomes a proper boolean.
   *
   * @param {any} v
   * @param {string | undefined} t
   * @returns {any}
   */
  private convertToType(v: any, t: string | undefined) {
    if ('boolean' === t) {
      return 'true' === v ? true : false;
    }

    return v;
  }
}