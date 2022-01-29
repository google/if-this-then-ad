import { Rule } from "../models/rule";
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from "../models/fire-store-entity";
import { Job } from '../models/job';
import { isDeepStrictEqual } from 'util';
import log from '../util/logger'; 

const jobsCollection = Collections.get(Collection.JOBS);
const repo = new Repository<Job>(jobsCollection);

/**
 * Creates a new job based on the rule Data. 
 * if a similar job already exists, no new job 
 * will be created. 
 * @param {Rule} rule 
 */
export const addJob = async (rule: Rule): Promise<string> => {

    log.info('Checking for existing similar jobs'); 
    const agentJobs = await repo.getBy("agentId", rule.agentId);

   
    // get all jobs for agent. 
    const job: Job = {
        agentId: rule.agentId,
        executionInterval: rule.ruleInterval,
        query: rule.agentQueryable
    }

    const existingJobs = agentJobs.filter((j) => {
        // remove ID to avoid deepequal being always false. 
        delete j.id;
        return isDeepStrictEqual(j, job);
    });
    log.info(`Found ${existingJobs.length} existing jobs`); 
    
    log.debug(existingJobs)

    if (!existingJobs) {
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
        return existingJobs[0].id as string;
    }

    return "";
}