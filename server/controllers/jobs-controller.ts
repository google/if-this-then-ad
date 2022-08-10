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

import { Request, Response } from 'express';
import { Rule } from '../models/rule';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { Job } from '../models/job';
import { isDeepStrictEqual } from 'util';
import { logger } from '../util/logger';
import { jobRunner } from '../job-runner/job-runner';

const jobsCollection = Collections.get(Collection.JOBS);
const repo = new Repository<Job>(jobsCollection);

/**
 * Creates a new job based on the rule Data.
 * If a similar job already exists, no new job
 * will be created.
 *
 * @param {Rule} rule
 * @returns {Promise<string>}
 */
export const addJob = async (rule: Rule): Promise<string> => {
  logger.debug('jobs-controller:addJob');
  logger.debug(JSON.stringify(rule, null, 2));
  logger.info('Checking for existing similar jobs');
  const agentJobs = await repo.getBy('agentId', rule.source.id);

  // get all jobs for agent.
  const job: Job = {
    agentId: rule.source.id,
    executionInterval: rule.executionInterval,
    query: rule.source.params,
    owner: rule.owner,
    rules: [],
  };
  logger.debug('Jobs-controller:addJob');
  logger.debug(job);

  const existingJobs = agentJobs.filter((j) => {
    // remove ID to avoid deepequal being always false.
    const id = j.id;
    delete j.id;
    delete j.lastExecution;

    if (isDeepStrictEqual(j, job)) {
      logger.debug('found existing job ' + id);
      j.id = id; // return ID, we need this later.
      return true;
    }
    return false;
  });

  logger.info(`Found ${existingJobs.length} existing jobs`);
  logger.debug(existingJobs);

  if (!existingJobs || existingJobs.length == 0) {
    try {
      logger.info(
        `job-controller:addJob: Creating a new job for agent ${job.agentId}`
      );
      const jobId = await repo.save(job);
      logger.info(`Job created :  ${jobId}`);
      return jobId;
    } catch (err) {
      logger.error(err);
    }
  }

  if (existingJobs.length > 0) {
    logger.debug(existingJobs[0].id);
    return existingJobs[0].id as string;
  }

  return '';
};

export const executeJobs = async (req: Request, res: Response) => {
  logger.info('job-controller:executeJobs: Executing all available jobs');
  jobRunner.runAll();
  res.json({ status: 'started' });
};

/**
 * Assigns a Rule to a Job
 * @param {string} ruleId
 * @param {string} jobId
 */
export const assignRuleToJob = async (ruleId: string, jobId: string) => {
  try {
    const job: Job = (await repo.get(jobId)) as Job;
    job.rules.push(ruleId);
    await repo.update(jobId, job);
    logger.debug(`Associated rule ${ruleId} with job ${jobId}`);
    return Promise.resolve();
  } catch (e) {
    logger.error(e);
    return Promise.reject(e);
  }
};

/**
 * Disassociate the rule from a job.
 * Job is deleted if its no longer associated to any of the rules.
 * @param {string} ruleId
 */
export const removeRuleFromJob = async (ruleId: string) => {
  try {
    const jobs = await repo.arrayContains('rules', ruleId);

    if (jobs.length > 0) {
      const job = jobs[0];
      const rules = job.rules.filter((r) => {
        return r !== ruleId;
      });
      logger.debug(rules);
      if (rules.length == 0) {
        // last rule associated to the job, remove the job.
        await repo.delete(job.id!);
        logger.info(`jobs-controller:removeRuleFromJob: Removed job ${job.id}`);
      } else {
        job.rules = rules;
        await repo.update(job.id!, job);
        logger.info(`Removed rule ${ruleId} from job ${job.id}`);
      }
    }
  } catch (e) {
    logger.error(e);
  }
};
