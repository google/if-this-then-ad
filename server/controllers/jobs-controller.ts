
import {Request, Response} from 'express';
import { RuleDefinition } from "../models/rule";
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from "../models/fire-store-entity";
import { Job } from '../models/job';
import { isDeepStrictEqual } from 'util';
import { log } from '@iftta/util' 
import * as JobRunner from '@iftta/job-runner'; 

const jobsCollection = Collections.get(Collection.JOBS);
const repo = new Repository<Job>(jobsCollection);

/**
 * Creates a new job based on the rule Data. 
 * if a similar job already exists, no new job 
 * will be created. 
 * @param {RuleDefinition} ruleDefinition 
 */
export const addJob = async (ruleDefinition: RuleDefinition): Promise<string> => {
    log.debug('jobs-controller:addJob');
    log.debug(JSON.stringify(ruleDefinition, null, 2));
    log.info('Checking for existing similar jobs'); 
    const agentJobs = await repo.getBy("agentId", ruleDefinition.agent.id);

       // get all jobs for agent. 
    const job: Job = {
        agentId: ruleDefinition.agent.id,
        executionInterval: ruleDefinition.rule.interval,
        query: ruleDefinition.agent.params
    }

    const existingJobs = agentJobs.filter((j) => {
        // remove ID to avoid deepequal being always false. 
        const id = j.id; 
        delete j.id;
        delete j.lastExecution; 
        
        if(isDeepStrictEqual(j, job)){
            log.debug('found existing job ' + id);
            j.id = id; // return ID, we need this later. 
            return true; 
        }
        return false;
    });

    log.info(`Found ${existingJobs.length} existing jobs`); 
    log.debug(existingJobs)

    if (!existingJobs || existingJobs.length ==0) {
        try{
            log.info(`Creating a new job for agent ${job.agentId}`);
            const jobId = await repo.save(job);
            log.info(`Job created :  ${jobId}`);
            return jobId;
        }catch(err){
            log.error(err);
        }
    }
    
    if (existingJobs.length > 0) {
        log.debug(existingJobs[0].id);
        return existingJobs[0].id as string;
    }

    return "";
}

export const executeJobs = async(req:Request, res:Response) => {
    log.info('Executing all available jobs');
    JobRunner.execute();
    res.json({'status': 'started'});
}