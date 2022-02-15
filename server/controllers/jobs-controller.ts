import { Request, Response } from 'express';
import { Rule } from '../models/rule';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { Job } from '../models/job';
import { isDeepStrictEqual } from 'util';
import { log } from '@iftta/util';
import * as JobRunner from '@iftta/job-runner';

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
    log.debug('jobs-controller:addJob');
    log.debug(JSON.stringify(rule, null, 2));
    log.info('Checking for existing similar jobs');
    const agentJobs = await repo.getBy('agentId', rule.source.id);

    // get all jobs for agent.
    const job: Job = {
        agentId: rule.source.id,
        executionInterval: rule.executionInterval,
        query: rule.source.params,
        owner: rule.owner,
        rules: [],
    };
    log.debug('Jobs-controller:addJob');
    log.debug(job);

    const existingJobs = agentJobs.filter((j) => {
        // remove ID to avoid deepequal being always false.
        const id = j.id;
        delete j.id;
        delete j.lastExecution;

        if (isDeepStrictEqual(j, job)) {
            log.debug('found existing job ' + id);
            j.id = id; // return ID, we need this later.
            return true;
        }
        return false;
    });

    log.info(`Found ${existingJobs.length} existing jobs`);
    log.debug(existingJobs);

    if (!existingJobs || existingJobs.length == 0) {
        try {
            log.info(`job-controller:addJob: Creating a new job for agent ${job.agentId}`);
            const jobId = await repo.save(job);
            log.info(`Job created :  ${jobId}`);
            return jobId;
        } catch (err) {
            log.error(err);
        }
    }

    if (existingJobs.length > 0) {
        log.debug(existingJobs[0].id);
        return existingJobs[0].id as string;
    }

    return '';
};

export const executeJobs = async (req: Request, res: Response) => {
    log.info('job-controller:executeJobs: Executing all available jobs');
    JobRunner.execute();
    res.json({ status: 'started' });
};

/**
 * Assigns a Rule to a Job
 * @param {string} ruleId
 * @param {string} jobId
 */
export const assignRuleToJob = async (ruleId: string, jobId: string) => {
    const job: Job = (await repo.get(jobId)) as Job;
    job.rules.push(ruleId);
    await repo.save(job);
    log.debug(`Associated rule ${ruleId} with job ${jobId}`);
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
            let job = jobs[0];
            const rules = job.rules.splice(0, 1, ruleId);
            if (rules.length > 0) {
                job.rules = rules;
                await repo.update(job.id!, job);
                log.info(`Removed rule ${ruleId} from job ${job.id}`);
            } else {
                // last rule associated to the job, remove the job.
                await repo.delete(job.id!);
                log.info(`jobs-controller:removeRuleFromJob: Removed job ${job.id}`);
            }
        }
    } catch (e) {
        log.error(e);
    }
};
