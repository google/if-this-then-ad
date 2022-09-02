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

import { TargetAgent, TargetAgentTask } from 'common/target';
import { add as dateAdd, isPast as isDatePast } from 'date-fns';
import { ModelSpec } from '../common/common';
import { Rule, RuleEvaluationResult } from '../common/rule';
import {
  SourceAgentData,
  SourceAgentTask,
  SourceAgentTaskResult,
} from '../common/source';
import { logger } from '../util/logger';
import { agentsService } from './agents-service';
import { collectionService } from './collections-service';
import { conditionsService } from './conditions-service';

/**
 * Manages rules.
 */
export class RulesService {
  /**
   * Something
   *
   * @returns {FirebaseCollection}
   */
  async listRules() {
    return await collectionService.rules.list();
  }

  /**
   * @param {ModelSpec<Rule>} ruleSpec the rule specification to insert
   * @returns {Promise<Rule>} the created rule
   */
  async insertRule(ruleSpec: ModelSpec<Rule>): Promise<Rule> {
    // persist rule
    const rules = collectionService.rules;
    const rule = await rules.insert(ruleSpec);

    return rule;
  }

  /**
   * Deletes a rule.
   * @param {string} ruleId the rule ID
   * @returns {Promise<void>} completes on deletion
   */
  async deleteRule(ruleId: string): Promise<void> {
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
   * Executes a single source agent task.
   * @param {string} agentId the source agent's ID
   * @param {SourceAgentTask} task the task to execute
   * @returns {Promise<SourceAgentTaskResult>} the result of the taks
   */
  private async executeSourceAgentTask(
    agentId: string,
    task: SourceAgentTask
  ): Promise<SourceAgentTaskResult> {
    const agent = agentsService.getSourceAgent(agentId);
    if (!agent) {
      logger.error(`Cannot run rule for unknown source agent: ${agentId}`);
      return { status: 'failed' };
    }
    logger.info(`Executing task via agent ${agentId}`);
    return agent.executeTask(task);
  }

  /**
   * Executes a set of target agent tasks.
   * @param {TargetAgentTask[]} targetTasks the tasks to execute
   * @returns {Promise<boolean>} completes when all task have been executed
   */
  async executeTargetAgentTasks(
    targetTasks: TargetAgentTask[]
  ): Promise<boolean> {
    let success = true;
    const involvedAgentIds = new Set(
      ...targetTasks.map((task) => task.agentId)
    );
    const involvedAgents: TargetAgent[] = [];

    for (const agentId of involvedAgentIds) {
      const agent = agentsService.getTargetAgent(agentId);
      if (!agent) {
        logger.error(
          `Received target agent task for unknown agent: ${agentId}`
        );
      } else {
        involvedAgents.push(agent);
      }
    }

    for (const agent of involvedAgents) {
      const tasksForAgent = targetTasks.filter(
        (task) => task.agentId === agent.id
      );
      const results = await agent.executeTasks(tasksForAgent);
      results.forEach((result) => {
        if (result.status !== 'success') {
          success = false;
          logger.error(`Target agent task did not succeed: ${agent.id}`);
        }
      });
    }

    return success;
  }

  /**
   * Determines if a rule is up for execution.
   * @param {Rule} rule the rule to inspect
   * @returns {boolean} true if the rule needs execution, false otherwise
   */
  private isRuleInNeedOfExecution(rule: Rule) {
    // For first time executions lastExecution will not be set
    if (rule.latestStatus?.lastExecution) {
      logger.debug(
        `Rule [${rule.id}] last execution date: ${rule.latestStatus.lastExecution}`
      );
      const nextExecutionDate = dateAdd(rule.latestStatus.lastExecution, {
        minutes: rule.executionInterval,
      });
      logger.debug(
        `Rule [${rule.id}] next execution date: ${nextExecutionDate}`
      );
      const needsExecution = isDatePast(nextExecutionDate);
      if (needsExecution) {
        logger.debug(`Rule [${rule.id}] needs execution.`);
      } else {
        logger.debug(`Rule [${rule.id}] does not need execution.`);
      }

      return needsExecution;
    } else {
      logger.debug(`Rule [${rule.id}] has never run and needs execution.`);
      return true;
    }
  }

  /**
   * Run all rules.
   */
  async runAll() {
    const rules = await rulesService.listRules();
    const users = collectionService.users;

    for (const rule of rules) {
      if (!this.isRuleInNeedOfExecution(rule)) {
        continue;
      }

      const executionDate = new Date();
      const agent = agentsService.getSourceAgent(rule.source.agentId);
      if (!agent) {
        logger.error(
          `Cannot run rule for unknown source agent: ${rule.source.agentId}`
        );
        return { status: 'failed' };
      }

      const owner = await users.get(rule.ownerId);

      if (!owner) {
        logger.error(`Rule owner does not exist: ${rule.ownerId}`);
        continue;
      }

      const dataPoints = [rule.condition.dataPoint];

      const sourceTasks: SourceAgentTask = {
        parameters: rule.source.parameters,
        ownerId: owner.id,
        ownerSettings: owner.settings,
        dataPoints,
      };

      // Execute data fetching task.
      const taskResult = await this.executeSourceAgentTask(
        rule.source.agentId,
        sourceTasks
      );

      logger.info(taskResult);

      // Process task failure.
      if (taskResult.status !== 'success') {
        logger.error(`Source agent task did not succeed: ${rule.id}`);
        rule.latestStatus = {
          success: false,
          lastExecution: executionDate,
          error: taskResult.error ?? 'Error while fetching source agent data.',
        };
        await collectionService.rules.update(rule.id, rule);
        continue;
      }

      // Evaluate rules.
      const ruleResult = rulesService.evaluateRule(rule, taskResult.data!);

      if (ruleResult.targetActions === undefined) {
        logger.info('No target actions defined');
        continue;
      }

      // Process rule evaluation failures.
      if (ruleResult.status === 'failed') {
        rule.latestStatus = {
          success: false,
          lastExecution: executionDate,
          error:
            ruleResult.error ??
            `Rule ${rule.id} condition could not be evaluated.`,
        };

        await collectionService.rules.update(rule.id, rule);
      }

      const targetTasks = ruleResult.targetActions.map((target) => ({
        agentId: target.agentId,
        parameters: target.parameters,
        owner: owner,
        ownerSettings: owner.settings,
        action: target.action,
      }));

      logger.info(targetTasks);

      // TODO: defrag tasks to avoid a target agent executing the same or
      // even conflicting actions on the same target entity and reduce API
      // calls.
      const success = await this.executeTargetAgentTasks(targetTasks);

      // Update rule status and last execution
      rule.latestStatus = {
        success,
        lastExecution: executionDate,
      };

      await collectionService.rules.update(rule.id, rule);
    }

    return { status: 'done' };
  }
}

export const rulesService = new RulesService();
