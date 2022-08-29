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
import { ModelSpec } from 'common/common';
import { Request, Response } from 'express';
import { User } from '../common/user';
import { collectionService } from '../services/collections-service';
import { logger } from '../util/logger';

const users = collectionService.users;

// TODO: add exception handling
//      input data validation
export const listAccounts = async (req: Request, res: Response) => {
  try {
    const userData = await users.list();
    return res.json(userData);
  } catch (e) {
    logger.debug(e);
    return res.status(500).send('Failed to fetch account list');
  }
};

export const create = async (req: Request, res: Response) => {
  // TODO: implement data validation.
  const user: ModelSpec<User> = { ...req.body };
  const result = await users.insert(user);
  return res.json(result);
};

export const get = async (req: Request, res: Response) => {
  const userData = await users.get(req.params.id);
  return res.json(userData);
};

/**
 * Updates user object.
 * @param {Request} req :id
 * @param {Response} res Updated user object
 */
export const update = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user: ModelSpec<User> = { ...req.body };
    await users.update(userId, user);
    return res.sendStatus(200);
  } catch (e) {
    logger.error(e);
    return res.sendStatus(500);
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const user = (await users.get(req.params.userId)) as User;
    user.settings = req.body;
    await users.update(req.params.userId, user);
  } catch (e) {
    logger.error(e);
    return res
      .status(500)
      .json({ error: 'Error occurred while updating user settings' });
  }
  return res.status(200).json({ status: 'ok' });
};

export const remove = async (req: Request, res: Response) => {
  const id = req.params.id;
  logger.debug(`Deleting document ${id}`);
  await users.delete(id);
  return res.json({ status: 'done' });
};

export const getBy = async (req: Request, res: Response) => {
  const fieldName = req.query.fieldName! as string;
  const fieldValue: string = req.query.fieldValue! as string;

  const data = await users.findWhere(fieldName, fieldValue);

  return res.json(data);
};
