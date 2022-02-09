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
 * Endpoint to create a rule.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const create = async (req: Request, res: Response) => {
    // TODO: add express-validator

    // Parse incoming rule data. 
    const ruleDefinition: RuleDefinition = {
        name: req.body.name,
        source : req.body.source, 
        condition: req.body.rule, 
        targets: req.body.targets
     }

    try {
        log.debug(ruleDefinition);
        log.info('Creating rule');

        // Create job based on rule
        const jobId = await JobController.addJob(ruleDefinition); 

        // Add job ID to rule
        ruleDefinition.jobId = jobId; 

        // Save rule
        const ruleId = await repo.save(ruleDefinition);

        ruleDefinition.id = ruleId;
        log.info(`Successfully created rule with id : ${ruleId}`);
        res.json(ruleDefinition);
    } catch (err) {
        console.log(err);
    }
};

/**
 * List all available rules.
 *
 * @param {Request} req 
 * @param {Response} res 
 */
export const list = async (req: Request, res: Response) => {
    const rules = await repo.list();

    res.json(rules);
};