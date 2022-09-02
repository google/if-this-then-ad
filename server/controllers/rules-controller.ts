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
import { ModelSpec } from '../common/common';
import { Comparator, Rule } from '../common/rule';
import { collectionService } from '../services/collections-service';
import { rulesService } from '../services/rules-service';
import { logger } from '../util/logger';

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
  const ruleSpec: ModelSpec<Rule> = {
    name: req.body.name,
    ownerId: req.body.ownerId,
    source: {
      agentId: req.body.source.agentId,
      parameters: req.body.source.parameters,
    },
    condition: {
      dataPoint: req.body.condition.dataPoint,
      comparator: req.body.condition.comparator as Comparator,
      compareValue: req.body.condition.compareValue,
    },
    targets: req.body.targets.map((target) => ({
      agentId: target.agentId,
      parameters: target.parameters,
      action: target.action,
    })),
    executionInterval: req.body.executionInterval,
  };

  try {
    logger.debug(ruleSpec);
    logger.info('rules-controller:create: Creating rule');
    const rule = await rulesService.insertRule(ruleSpec);
    logger.info(
      `rules-controller:create: Successfully created rule with id : ${rule.id}`
    );
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
  return res.json(await collectionService.rules.list());
};

/**
 * Delete a rule and its associated jobs.
 *
 * @param {Request} req
 * @param {Response} res
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const ruleId = req.params.id;

    const rule = await collectionService.rules.get(ruleId);
    if (rule) {
      if (rule.ownerId === userId) {
        await rulesService.deleteRule(rule.id);
        return res.status(200).send();
      } else {
        const msg = `FORBIDDEN: Non ower userId: ${userId} attempted to delete Rule ${ruleId}`;
        logger.warn(msg);
        return res.status(403).send(msg);
      }
    } else {
      return res.status(404).send('Not found');
    }
  } catch (e) {
    logger.error(e);
    return res.sendStatus(500);
  }
};

/**
 * Get a single rule by id.
 *
 * @param {string} req :id
 * @param {Response} res
 */
export const get = async (req: Request, res: Response) => {
  try {
    const ruleId = req.params.id;
    const rule = await collectionService.rules.get(ruleId);
    return res.json(rule);
  } catch (e) {
    logger.error(e);
    return res.sendStatus(500);
  }
};

/**
 * Get all rules for a user.
 *
 * @param {Request} req :id
 * @param {Response} res Rules[]
 */
export const getByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const rules = await collectionService.rules.findWhere('ownerId', userId);
    return res.json(rules);
  } catch (e) {
    logger.error(e);
    return res.sendStatus(500).json(e);
  }
};

/**
 * Run all rules.
 *
 * @param {Request} req
 * @param {Response} res
 * @returns {Response}
 */
export const runAll = (req: Request, res: Response) => {
  try {
    rulesService.runAll();

    return res.json({ status: 'started' });
  } catch (e) {
    logger.error(e);
    return res.sendStatus(500).json(e);
  }
};
