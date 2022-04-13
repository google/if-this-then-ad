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

require('module-alias/register');

import { Request, Response } from 'express';
import { log } from '@iftta/util';
import { User } from 'models/user';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';

const usersCollection = Collections.get(Collection.USERS);
const userRepository = new Repository<User>(usersCollection);

export const update = async (req: Request, res: Response) => {
    try {
        const user = (await userRepository.get(req.params.userId)) as User;
        user.userSettings = req.body.userSettings;
        await userRepository.update(req.params.userId, user);
    } catch (e) {
        log.error(e);
        res.status(500).json({error: 'Error accured while updating user settings.'});
    }

    return res.end();
};