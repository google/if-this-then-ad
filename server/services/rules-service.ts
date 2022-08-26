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

import { ModelSpec } from '../common/common';
import { Rule, RuleEvaluationResult } from '../common/rule';
import { SourceAgentData } from '../common/source';
import { logger } from '../util/logger';
import { collectionService } from './collections-service';
import { conditionsService } from './conditions-service';

/**
 * Manages rules.
 */
export class RulesService {
  /**
   * @param {ModelSpec<Rule>} ruleSpec the rule specification to insert
   * @returns {Promise<Rule>} the created rule
   */
  async insertRule(ruleSpec: ModelSpec<Rule>): Promise<Rule> {
    // persist rule
    const rules = collectionService.rules;
    const rule = await rules.insert(ruleSpec);

    const job = await collectionService.jobs.findOrCreateJobForRule(rule);
    job.ruleIds.push(rule.id);
    const jobs = collectionService.jobs;
    await jobs.update(job.id, job);

    return rule;
  }

  /**
   * Deletes a rule.
   * @param {string} ruleId the rule ID
   * @returns {Promise<void>} completes on deletion
   */
  async deleteRule(ruleId: string): Promise<void> {
    const jobs = collectionService.jobs;
    const jobsWithRule = await jobs.findWhereArrayContains('ruleIds', ruleId);
    for (const job of jobsWithRule) {
      job.ruleIds = job.ruleIds.filter((jobRuleId) => jobRuleId !== ruleId);
      if (!job.ruleIds.length) {
        await jobs.delete(job.id);
      } else {
        await jobs.update(job.id, job);
      }
    }
    const rules = collectionService.rules;
    await rules.delete(ruleId);
  }

  /**
   * Updates a rule.
   * @param {string} id the rule ID
   * @param {ModelSpec<Rule>} ruleSpec the rule data.
   * @returns {Promise<Rule>} the updated rule
   */
  async updateRule(id: string, ruleSpec: ModelSpec<Rule>): Promise<Rule> {
    await this.deleteRule(id);
    return await this.insertRule(ruleSpec);
  }

  /**
   * Evaluates a rule's condition against the source agent data.
   * @param {Rule} rule the rule to evaluate
   * @param {SourceAgentData} data the data against which to evaluate the rule
   * @returns {RuleEvaluationResult} the evaluation results
   */
  private evaluateRule(
    rule: Rule,
    data: SourceAgentData
  ): RuleEvaluationResult {
    const { condition } = rule;

    if (!(condition.dataPoint in data)) {
      logger.error(
        `Required data point not in source data ${condition.dataPoint}.`
      );
      return {
        status: 'failed',
        rule: rule,
      };
    }
    const sourceDataPointValue = data[condition.dataPoint]!;
    const evaluationResult = conditionsService.evaluate(
      sourceDataPointValue,
      condition.comparator,
      condition.compareValue
    );

    if (evaluationResult === undefined) {
      logger.error(`Condition evaluation failed. for rule: ${rule.id}`);
      return {
        status: 'failed',
        error: `Condition evaluation failed. for rule: ${rule.id}`,
        rule: rule,
      };
    }

    const targetActions = rule.targets.map((target) => {
      const action = evaluationResult
        ? target.action
        : target.action === 'ACTIVATE'
        ? 'DEACTIVATE'
        : 'ACTIVATE';

      return {
        agentId: target.agentId,
        parameters: target.parameters,
        action,
      };
    });

    return {
      status: 'success',
      targetActions: targetActions,
      rule,
    };
  }

  /**
   * Evaluates a set of rules agains source agent data.
   * @param {Rule[]} rules the rules to evaluate
   * @param {SourceAgentData} data the data against which to evaluate
   * @returns {RuleEvaluationResult[]} a list of evaluation results
   */
  evaluateRules(rules: Rule[], data: SourceAgentData): RuleEvaluationResult[] {
    return rules.map((rule) => this.evaluateRule(rule, data));
  }
}

export const rulesService = new RulesService();
