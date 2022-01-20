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

// import Firestore from '@google-cloud/firestore';
import {Request, Response} from 'express';
import Repository from '../services/repository-service';
import log from '../util/logger';
import Collections from '../services/collection-factory';

const usersCollection = Collections.get('users');
const userRepo = new Repository<User>(usersCollection);

//TODO: add exception handling
//      input data validation
export const listAccounts = async (req: Request, res: Response) => {
    log.debug(req.query);
    if (req.query.fieldName != '' && req.query.fieldValue != '') {
        return getBy(req, res);
    }

    const userData = await userRepo.list();

    return res.json(userData);
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
    const user: User = {...req.body};

    const result = await userRepo.save(user);

    return res.json(result);
};

export const get = async (req: Request, res: Response) => {
    const userData = await userRepo.get(req.params.id);

    return res.json(userData);
};

export const update = async (req: Request, res: Response) => {
    const user: User = {...req.body};
    const result = await userRepo.update(req.params.id, user);

    return res.json(result);
};

export const remove = async (req: Request, res: Response) => {
    const id = req.params.id;
    log.debug(`Deleting document ${id}`);
    await userRepo.delete(id);
    return res.json({status: 'done'});
};

export const getBy = async (req: Request, res: Response) => {
    const fieldName = req.query.fieldName! as string;
    const fieldValue: string = req.query.fieldValue! as string;

    const data = await userRepo.getBy(fieldName, fieldValue);

    return res.json(data);
};
