import { add as dateAdd, isPast as isDatePast } from 'date-fns';
import { Job } from '../common/common';
import { Rule, RuleTargetAction } from '../common/rule';
import { SourceAgentTask, SourceAgentTaskResult } from '../common/source';
import { TargetAgent, TargetAgentTask } from '../common/target';
import { logger } from '../util/logger';
import { agentsService } from './agents-service';
import { collectionService } from './collections-service';
import { rulesService } from './rules-service';

/**
 * Manages and runs jobs.
 */
export class JobsService {
  /**
   * Determines if a job is up for execution.
   * @param {Job} job the job to inspect
   * @returns {boolean} true if the job needs execution, false otherwise
   */
  private isJobInNeedOfExecution(job: Job) {
    // For first time executions lastExecution will not be set
    if (job.lastExecutionDate) {
      logger.debug(
        `Job [${job.id}] last execution date: ${job.lastExecutionDate}`
      );
      const nextExecutionDate = dateAdd(job.lastExecutionDate, {
        minutes: job.executionInterval,
      });
      logger.debug(`Job [${job.id}] next execution date: ${nextExecutionDate}`);
      const needsExecution = isDatePast(nextExecutionDate);
      if (needsExecution) {
        logger.debug(`Job [${job.id}] needs execution.`);
      } else {
        logger.debug(`Job [${job.id}] does not need execution.`);
      }

      return needsExecution;
    } else {
      logger.debug(`Job [${job.id}] has never run and needs execution.`);
      return true;
    }
  }

  /**
   * Get all jobs that are up for execution.
   * @returns {Promise<Job[]>} the jobs that need to executed now
   */
  private async getJobsInNeedOfExecution() {
    // Get a list of jobs to execute
    logger.info('Fetching job list to execute');
    const allJobs: Job[] = await collectionService.jobs.list();
    // Filter by execution interval
    const nowUTC = new Date();
    logger.info(
      `System time used for calculating execution interval: ${nowUTC}`
    );
    logger.info(`Filtering jobs that have reached execution interval`);
    const jobs = allJobs.filter((job) => this.isJobInNeedOfExecution(job));
    return jobs;
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
      logger.error(`Cannot run job for unknown source agent: ${agentId}`);
      return { status: 'failed' };
    }
    logger.info(`Executing task via agent ${agentId}`);
    return agent.executeTask(task);
  }

  /**
   * Retrieves rules associated with a job.
   * @param {Job} job the job
   * @returns {Promise<Rule[]>} the rules associated with the job.
   */
  async getRulesAssociatedWithJob(job: Job) {
    const rules = collectionService.rules;
    const jobRules: Rule[] = [];
    for (const ruleId of job.ruleIds) {
      const rule = await rules.get(ruleId);
      if (!rule) {
        logger.error(
          `Job has non-existent rule association: ${job.id} -> ${ruleId}. Skipping rule.`
        );
        continue;
      }
      jobRules.push(rule);
    }
    return jobRules;
  }

  /**
   * Executes a set of target agent tasks.
   * @param {TargetAgentTask[]} targetTasks the tasks to execute
   * @returns {Promise<void>} completes when all task have been executed
   */
  async executeTargetAgentTasks(targetTasks: TargetAgentTask[]): Promise<void> {
    const involvedAgentIds = new Set(
      ...targetTasks.map((task) => task.agentId)
    );
    const involvedAgents: TargetAgent[] = [];

    [...involvedAgentIds].forEach((agentId) => {
      const agent = agentsService.getTargetAgent(agentId);
      if (!agent) {
        logger.error(
          `Received target agent task for unknown agent: ${agentId}`
        );
        return;
      } else {
        involvedAgents.push(agent);
      }
    });

    involvedAgents.forEach(async (agent) => {
      const tasksForAgent = targetTasks.filter(
        (task) => (task.agentId = agent.id)
      );
      const results = await agent.executeTasks(tasksForAgent);
      results.forEach((result) => {
        if (result.status !== 'success') {
          logger.error(`Target agent task did not succeed: ${agent.id}`);
        }
      });
    });
  }

  /**
   * Runs all jobs waiting for execution.
   * @returns {Promise<void>} completes when waiting jobs have run
   */
  async runJobs() {
    const jobs = await this.getJobsInNeedOfExecution();
    if (jobs.length) {
      logger.info(
        'JobManager.run: No jobs to execute. Sleeping till next execution cycle'
      );
      return;
    }

    let targetTasks: TargetAgentTask[] = [];
    const executionDate = new Date();
    for (const job of jobs) {
      const users = collectionService.users;
      const owner = await users.get(job.ownerId);
      if (!owner) {
        logger.error(`Job owner does not exist: ${job.ownerId}`);
        continue;
      }

      const rules = await this.getRulesAssociatedWithJob(job);

      if (!rules.length) {
        logger.error(`Source agent job has no rules to evaluate.`);
        continue;
      }

      const dataPoints = [
        ...new Set(rules.map((rule) => rule.condition.dataPoint)),
      ];
      const sourceTasks: SourceAgentTask = {
        parameters: job.sourceParameters,
        ownerId: owner.id,
        ownerSettings: owner.settings,
        dataPoints,
      };

      // Execute data fetching task.
      const taskResult = await this.executeSourceAgentTask(
        job.sourceAgentId,
        sourceTasks
      );
      // Process task failure.
      if (taskResult.status !== 'success') {
        logger.error(`Source agent job did not succeed: ${job.id}`);
        rules.forEach((rule) => {
          rule.latestStatus = {
            success: false,
            lastExecution: executionDate,
            error:
              taskResult.error ?? 'Error while fetching source agent data.',
          };
        });
        await Promise.all(
          rules.map((rule) => collectionService.rules.update(rule.id, rule))
        );
        continue;
      }

      // Evaluate rules.
      const ruleResults = rulesService.evaluateRules(rules, taskResult.data!);
      // Process rule evaluation failures.
      const failedRuleResults = ruleResults.filter(
        (ruleResult) => ruleResult.status === 'failed'
      );
      failedRuleResults.forEach((ruleResult) => {
        ruleResult.rule.latestStatus = {
          success: false,
          lastExecution: executionDate,
          error:
            ruleResult.error ??
            `Rule ${ruleResult.rule.id} condition could not be evaluated.`,
        };
      });
      await Promise.all(
        failedRuleResults.map((ruleResult) =>
          collectionService.rules.update(ruleResult.rule.id, ruleResult.rule)
        )
      );

      // Translate successful evaluations into target agent tasks.
      const targetActions = ruleResults
        .filter((ruleResult) => ruleResult.targetActions !== undefined)
        .reduce(
          (acc, ruleResult) => acc.concat(ruleResult.targetActions!),
          [] as RuleTargetAction[]
        );

      const jobTargetTasks = targetActions.map((target) => ({
        agentId: target.agentId,
        parameters: target.parameters,
        owner: owner,
        ownerSettings: owner.settings,
        action: target.action,
      }));
      targetTasks = targetTasks.concat(jobTargetTasks);

      // TODO: defrag tasks to avoid a target agent executing the same or
      // even conflicting actions on the same target entity and reduce API
      // calls.
      await this.executeTargetAgentTasks(targetTasks);
    }
  }
}

/**
 * The default singleton jobs service.
 */
export const jobsService = new JobsService();
