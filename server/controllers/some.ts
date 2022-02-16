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

class SomeController {
    /**
     * Hello route
     * @param {Request} req
     * @param {Response}res
     */

    public async hello(req: Request, res: Response) {
        res.send('Some Controller');
    }

    public async fetch(req: Request, res: Response) {
        console.log(req.query.level);
        if (req.query.level === '0') {
            const entities = [
                {
                    id: '2015636',
                    name: '! AC2 Testing Partner',
                    level: 1,
                    expandable: true,
                    isLoading: false,
                    advertiserId: '123',
                    type: 'line-item',
                },
            ];

            res.json(entities);
        } else {
            const entities = [
                {
                    id: 'adv-1',
                    name: 'My Advertiser 1',
                    level: 2,
                    expandable: true,
                    isLoading: false,
                    advertiserId: '123',
                    type: 'advertiser',
                },
                {
                    id: 'adv-2',
                    name: 'My Advertiser 2',
                    level: 2,
                    expandable: true,
                    isLoading: false,
                    advertiserId: '123',
                    type: 'advertiser',
                },
            ];

            res.json(entities);
        }
    }
}

export default new SomeController();
