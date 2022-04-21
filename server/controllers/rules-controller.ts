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

import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Rule } from '../models/rule';
import { Collection } from '../models/fire-store-entity';
import { log } from '@iftta/util';
import * as JobController from '../controllers/jobs-controller';
import { Request, Response } from 'express';

const rulesCollection = Collections.get(Collection.RULES);
const repo = new Repository<Rule>(rulesCollection);

/**
 * Endpoint to create a rule.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const create = async (req: Request, res: Response) => {
    console.log('create rule', req.body);
    // TODO: add express-validator

    // Parse incoming rule data.
    const rule: Rule = {
        name: req.body.name,
        owner: req.body.owner,
        source: req.body.source,
        condition: req.body.condition,
        executionInterval: req.body.executionInterval,
        targets: req.body.targets,
    };

    try {
        log.debug(rule);
        log.info('rules-controller:create: Creating rule');

        // Create job based on rule
        const jobId = await JobController.addJob(rule);

        // Add job ID to rule
        rule.jobId = jobId;

        // Save rule
        const ruleId = await repo.save(rule);

        rule.id = ruleId;

        await JobController.assignRuleToJob(ruleId, jobId);

        log.info(`rules-controller:create: Successfully created rule with id : ${ruleId}`);
        return res.json(rule);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
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

    return res.json(rules);
};

/**
 * Deletes a rule and its associated jobs
 * @param req
 * @param res
 */
export const remove = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const ruleId = req.params.id;
     
        const rule = await repo.get(ruleId);
        if (rule?.owner == userId) {
            await JobController.removeRuleFromJob(ruleId);
            await repo.delete(ruleId);
            return res.sendStatus(204);
        }
        const msg = `FORBIDDEN: Non ower userId: ${userId} attempted to delete Rule ${ruleId}`;
        log.warn(msg);
        return res.status(403).send(msg);
    } catch (e) {
        log.error(e);
        return res.sendStatus(500);
    }
};

/**
 * Gets a single rule by Id
 * @param {string} req :id
 * @param res
 */
export const get = async (req: Request, res: Response) => {
    try {
        const ruleId = req.params.id;
        const rule = await repo.get(ruleId);
        return res.json(rule);
    } catch (e) {
        log.error(e);
        return res.sendStatus(500);
    }
};

/**
 * Gets all rules for a user
 * @param req :id
 * @param res Rules[]
 */
export const getByUser = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const rules = await repo.getBy('owner', userId);
        return res.json(rules);
    } catch (e) {
        log.error(e);
        return res.sendStatus(500).json(e);
    }
};
