import { Request, Response } from 'express'
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { RuleDefinition } from '../models/rule'
import { Collection } from '../models/fire-store-entity';
import {log} from '@iftta/util'
import * as JobController from '../controllers/jobs-controller'; 

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<RuleDefinition>(rulesCollection);
/**
 * Endpoint to enable creation of rules
 * @param {Request} req
 * @param {Response} res
 */
export const create = async (req: Request, res: Response) => {
    //TODO: add express-validator

    // parse incoming rule data. 
    let ruleDefinition: RuleDefinition = {
        agent : req.body.agent, 
        rule: req.body.rule, 
        targets: req.body.targets
     }

    try {
        log.debug(ruleDefinition);
        log.info('Creating rule');
        const jobId = await JobController.addJob(ruleDefinition); 
        ruleDefinition.jobId = jobId; 
        const ruleId = await repo.save(ruleDefinition);
        ruleDefinition.id = ruleId;
        log.info(`Successfully created rule with id : ${ruleId}`);
        res.json(ruleDefinition);
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