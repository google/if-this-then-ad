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

const { PubSub } = require('@google-cloud/pubsub');
import { log, date } from '@iftta/util';
import OpenWeatherMap from '../agents/source-agents/open-weather-map';
import DV360Ads from '../agents/target-agents/dv360-ads';
import {
  AgentResult,
  RuleResult,
  AgentTask,
  ExecutionTime,
  Job,
  ActionResult,
  Rule,
} from './interfaces';
import { Collection } from '../models/fire-store-entity';
import rulesEngine from '../packages/rule-engine';
import Collections from '../services/collection-factory';
import Repository from '../services/repository-service';
import TaskCollector from './task-collector';
import TaskConfiguration from './task-configuration';
import AmbeeAgent from '@iftta/ambee-agent';
import googleAdsAgent from '@iftta/google-ads';

// Temp coupling between packages/
// TODO: replace this with sending messages over pubsub.
const pubSubClient = new PubSub();
const jobsCollection = Collections.get(Collection.JOBS);
const rulesCollection = Collections.get(Collection.RULES);

const jobsRepo = new Repository<Job>(jobsCollection);
const rulesRepo = new Repository<Rule>(rulesCollection);

/**
 * Job Runner class
 */
class JobRunner {
  client;

  /**
   * Constructor.
   *
   * @param {any} client
   * @param {Repository<Job>} jobsRepository
   * @param {Repository<Rule>} rulesRepository
   */
  constructor(
    client,
    private jobsRepository: Repository<Job>,
    private rulesRepository: Repository<Rule>
  ) {
    this.client = client;
  }

  /**
   * Get topic.
   *
   * @param {string} name
   * @returns {string|null}
   */
  private async getTopic(name: string) {
    const [topics] = await this.client.getTopics();
    const topicResult = topics.filter((topic) => {
      return topic.name == name;
    });

    if (topicResult.length > 0) {
      return topicResult[0];
    }
    return null;
  }

  /**
   * Create topic if not exists.
   *
   * @param {string} name
   * @returns {string}
   */
  private async createTopicIfNotExists(name: string) {
    // TODO: define schemas
    // add to topic creation processd
    const fullTopicName = `projects/${process.env.PROJECT_ID}/topics/${name}`;
    let topic = await this.getTopic(fullTopicName);
    const subsId = process.env.AGENTS_TOPIC_ID + '_subs';

    try {
      if (topic == null) {
        await this.client.createTopic(name);
        log.info(`New topic created : ${fullTopicName}`);
        topic = await this.getTopic(fullTopicName);
        // Creates a subscription on that new topic
        await topic.createSubscription(subsId);
        log.info(`Subscription ${subsId} for topic ${topic.name} created`);
        return topic;
      }

      const [subscriptions] = await topic.getSubscriptions();

      const existingSubscription = subscriptions.filter((s) => {
        return s.name == subsId;
      });

      if (!existingSubscription) {
        log.info('Found existing topic, but missing a subscription');
        await topic.createSubscription(subsId);
        log.info(
          `Subscription ${subsId} created on existing topic. ${fullTopicName}`
        );
      }
      log.info(`Topic ${name} exists, skipping creation`);
    } catch (err) {
      log.error(JSON.stringify(err));
    }

    return topic;
  }

  /**
   * Initialize Pubsub topics.
   *
   * @returns {string}
   */
  public async init() {
    const topicName: string = process.env.AGENTS_TOPIC_ID || 'agent-results';
    const topic = await this.createTopicIfNotExists(topicName);

    return topic;
  }

  /**
   * List source agents.
   *
   * @returns {Object}
   */
  private listSourceAgents() {
    return {
      'open-weather-map': new OpenWeatherMap(),
      ambee: new AmbeeAgent(),
    };
  }

  /**
   * List target agents.
   *
   * @returns {Object}
   */
  private listTargetAgents() {
    return {
      'dv360-agent': DV360Ads,
      'googleads-agent': googleAdsAgent,
    };
  }

  /**
   * Run jobs.
   *
   * @param {Job[]}jobs Runs all jobs
   * @returns {AgentResult} AgentResult generator use .next() to get values out of it.
   *
   */
  private async *runJobs(jobs: Job[]) {
    const agents = this.listSourceAgents();

    log.debug('runJobs jobs');
    log.debug(jobs);

    for (const job of jobs) {
      const agent = agents[job.agentId];
      log.info(`Executing job ${job.id} via agent ${job.agentId}`);
      try {
        yield await agent.execute(job);
      } catch (e) {
        log.error(e);
      }
    }
  }

  /**
   * Update job execution times.
   *
   * @param {Array<ExecutionTime>} jobs
   */
  private async updateJobExecutionTimes(jobs: Array<ExecutionTime>) {
    for (const j of jobs) {
      const job: Job | undefined = await this.jobsRepository.get(j.jobId);
      if (job) {
        job.lastExecution = new Date();
        await this.jobsRepository.update(j.jobId, job);
        log.info(
          `Set lastExecution time: ${j.lastExecution} on job : ${j.jobId}`
        );
      }
    }
  }

  /**
   * Get all jobs that are up for execution.
   *
   * @returns {Promise<Array<Job>>}
   */
  private async getEligibleJobs(): Promise<Array<Job>> {
    // Get a list of jobs to execute
    log.info('Fetching job list to execute');
    const allJobs: Job[] = await this.jobsRepository.list();

    // Filter by execution interval
    const nowUTC = new Date();
    log.info(`System time used for calculating Execution interval ${nowUTC}`);
    log.info(`Filtering jobs that have reached execution interval`);

    const jobs = allJobs.filter((j) => {
      // For first time executions lastExecution will not be set
      if (!date.isValid(j.lastExecution)) {
        log.debug(`Invalid date in last execution ${j.id}`);
        log.debug(j.lastExecution);
        j.lastExecution = 0;
        return true;
      }
      log.debug(
        `job-runner:getEligibleJobs: jobTime: ${j.id} : ${j.lastExecution}`
      );
      const nextRuntime = date.add(j.lastExecution!, {
        minutes: j.executionInterval,
      });
      log.info(`Job: ${j.id} next execution : ${nextRuntime}`);

      return date.isPast(nextRuntime);
    });

    return jobs;
  }

  /**
   * Get user settings for job.
   *
   * @param {Job[]} jobs
   * @returns {Job[]}
   */
  private async getUserSettingsForJobs(jobs: Job[]) {
    const jobsWithSettings: Job[] = [];

    for (const job of jobs) {
      const userId = job.owner;
      job.ownerSettings = await TaskConfiguration.getUserSettings(userId);
      jobsWithSettings.push(job);
    }

    return jobsWithSettings;
  }

  /**
   * Get user settings for tasks.
   *
   * @param {AgentTask[]} tasks
   * @returns {AgentTask[]}
   */
  private async getUserSettingsForTasks(tasks: AgentTask[]) {
    const tasksWithSettings: AgentTask[] = [];

    for (const task of tasks) {
      const userId = task.ownerId!;
      task.ownerSettings = await TaskConfiguration.getUserSettings(userId);
      tasksWithSettings.push(task);
    }

    return tasksWithSettings;
  }

  /**
   * Run all jobs.
   *
   * @returns {null}
   */
  public async runAll() {
    const executionTimes: Array<ExecutionTime> = [];
    const collectExecutionTimes = (currentResult) => {
      const execTime: ExecutionTime = {
        jobId: currentResult.jobId,
        lastExecution: currentResult.timestamp,
      };
      executionTimes.push(execTime);
    };
    // Get a list of jobs to execute
    log.info('job-runner:runAll: Fetching job list to execute');
    const eligibleJobs = await this.getEligibleJobs();
    const jobCount = eligibleJobs.length;
    log.debug('job-runner:runAll: List of jobs to execute');
    log.info(`job-runner:runAll: Got ${jobCount} jobs to execute`);
    log.debug(eligibleJobs);

    if (jobCount == 0) {
      log.info('job-runner:runAll: Sleeping till next execution cycle');
      return;
    }

    const eligibleJobsWithSettings = await this.getUserSettingsForJobs(
      eligibleJobs
    );
    log.debug(['JobRunner.runAll eligibleJobs', eligibleJobs]);
    // execute each job agent
    // await for yielded results
    log.info('job-runner:runAll: Executing jobs on all available agents');
    const agentResultIter = this.runJobs(eligibleJobsWithSettings);
    let agentResult = agentResultIter.next();

    // Collect all actions that need to be performed
    // on the target systems.

    const taskCollector = new TaskCollector();
    while (!(await agentResult).done) {
      log.debug('job-runner:runAll: jobResult');
      log.debug(await agentResult);
      // pass this to rules engine.
      const currentResult: AgentResult = (await agentResult).value;
      collectExecutionTimes(currentResult);
      log.info('Publishing results to the rule engine');
      log.info(`Completed job: ${currentResult.jobId}`);
      log.debug(currentResult);
      const results: Array<RuleResult> = await rulesEngine.processMessage(
        currentResult
      );

      taskCollector.put(currentResult, results);

      agentResult = agentResultIter.next();
    }

    log.info('Updating Last execution time of jobs');

    // Update execution times in the jobs collection
    await this.updateJobExecutionTimes(executionTimes);

    const tasks = taskCollector.get();
    log.debug('TASKS');
    log.debug(tasks);
    await this.processTasks(tasks);
  }

  /**
   * Process Tasks.
   *
   * @param {Array<AgentTask>} tasks
   */
  private async processTasks(tasks: Array<AgentTask>) {
    const agents = this.listTargetAgents();
    log.debug(`job-runner:processTasks: #of tasks ${tasks.length}`);
    Promise.all(
      tasks.map(async (task) => {
        const targetAgent = agents[task.target.agentId];
        return targetAgent.execute(task);
      })
    ).then(async (taskResults) => {
      log.debug(taskResults);
      await this.updateRuleRunStatus(taskResults.flat());
    });
  }

  /**
   * Update each affected rule with timestamp and execution status.
   *
   * @param {ActionResult[]}taskExecutionResults
   */
  private async updateRuleRunStatus(taskExecutionResults: Array<ActionResult>) {
    for (const actionResult of taskExecutionResults) {
      const rule = await this.rulesRepository.get(actionResult.ruleId)!;

      if (rule) {
        const status = {
          success: actionResult.success ? actionResult.success : false,
          lastExecution: actionResult.timestamp,
          message: actionResult.error
            ? actionResult.error
            : `${actionResult.displayName} : ${actionResult.entityStatus}`,
        };
        rule.status = status;
        this.rulesRepository.update(rule.id!, rule);
        log.debug(
          `Execution : Rule ${rule.id} success: ${status.success}`,
          status
        );
      }
    }
  }
}

export default new JobRunner(pubSubClient, jobsRepo, rulesRepo);
