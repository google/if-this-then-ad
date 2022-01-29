import { Request, Response } from 'express'
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Rule } from '../models/rule'
import { Collection } from '../models/fire-store-entity';
import log from '../util/logger';
import * as JobController from '../controllers/jobs-controller'; 

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<Rule>(rulesCollection);
/**
 * Endpoint to enable creation of rules
 * @param {Request} req
 * @param {Response} res
 */
export const create = async (req: Request, res: Response) => {
    //TODO: add express-validator

    // parse incoming rule data. 
    let rule: Rule = { ...req.body }

    try {
        log.debug(req.body);
        log.info('Creating rule');
        const jobId = await JobController.addJob(rule); 
        rule.jobId = jobId; 
        const ruleId = await repo.save(rule);
        rule.id = ruleId;
        log.info(`Successfully created rule with id : ${ruleId}`);
        res.json(rule);
    } catch (err) {
        console.log(err);
    }
  
}

/**
 * List all available rules 
 * @param {Request} req 
 * @param {Response} res 
 */
export const list = async (req: Request, res: Response) => {

    res.json({ "all-the": "rules here" });
}