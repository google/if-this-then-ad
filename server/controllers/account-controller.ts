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
import Repository from '../services/repository-service';
import { log } from '@iftta/util';
import Collections from '../services/collection-factory';
import { User } from '../models/user';
import { Collection } from '../models/fire-store-entity';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);

//TODO: add exception handling
//      input data validation
export const listAccounts = async (req: Request, res: Response) => {
    try {
        const userData = await userRepo.list();
        return res.json(userData);
    } catch (e) {
        log.debug(e);
        return res.status(500).send('Failed to fetch account list');
    }
};

export const create = async (req: Request, res: Response) => {
    // TODO: implement data validation.

    // const user:User = {
    //     profileId : req.body.profileId,
    //     displayName : req.body.displayName,
    //     givenName : req.body.givenName,
    //     familyName : req.body.familyName,
    //     gender : req.body.gender,
    //     email : req.body.email,
    //     verified : req.body.verified,
    //     profilePhoto : req.body.profilePhoto,
    //     locale : req.body.locale,
    //     authToken : req.body.authToken,
    //     refreshToken : req.body.refreshToken,
    //     tokenProvider : req.body.tokenProvider,
    // };

    // can also be done like this
    const user: User = { ...req.body };

    const result = await userRepo.save(user);

    return res.json(result);
};

export const get = async (req: Request, res: Response) => {
    const userData = await userRepo.get(req.params.id);

    return res.json(userData);
};

/**
 * Updates user object.
 * @param req :id
 * @param res Updated user object
 */
export const update = async (req: Request, res: Response) => {
    try {
        const userId = req.params.id;
        const user: User = { ...req.body };
        await userRepo.update(userId, user);
        return res.sendStatus(200);
    } catch (e) {
        log.error(e);
        return res.sendStatus(500);
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const user = (await userRepo.get(req.params.userId)) as User;
        user.userSettings = req.body;
        await userRepo.update(req.params.userId, user);
    } catch (e) {
        log.error(e);
        res.status(500).json({error: 'Error accured while updating user settings.'});
    }

    return res.sendStatus(200);
};

export const remove = async (req: Request, res: Response) => {
    const id = req.params.id;
    log.debug(`Deleting document ${id}`);
    await userRepo.delete(id);
    return res.json({ status: 'done' });
};

export const getBy = async (req: Request, res: Response) => {
    const fieldName = req.query.fieldName! as string;
    const fieldValue: string = req.query.fieldValue! as string;

    const data = await userRepo.getBy(fieldName, fieldValue);

    return res.json(data);
};
