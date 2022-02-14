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
 * if a similar job already exists, no new job
 * will be created.
 *
 * @param {Rule} rule
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
        owner:rule.owner,
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
