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

/**
 * Controller for debugging.
 */
class SomeController {
  /**
   * Fetch dummy data.
   *
   * @param {Request} req
   * @param {Response} res
   */
  public async fetch(req: Request, res: Response) {
    console.log(req.params.entityType);
    if (req.params.entityType === 'partner') {
      const entities = [
        {
          name: '! AC2 Testing Partner',
          partnerId: '2015636',
          advertiserId: null,
          insertionOrderId: null,
          lineItemId: null,
          entityStatus: 'ACTIVE',
        },
      ];

      res.json(entities);
    } else if (req.params.entityType === 'advertiser') {
      const entities = [
        {
          name: 'My Advertiser 1',
          partnerId: '2015636',
          advertiserId: '123',
          insertionOrderId: null,
          lineItemId: null,
          entityStatus: 'ACTIVE',
        },
        {
          name: 'My Advertiser 2',
          partnerId: '2015636',
          advertiserId: '234',
          insertionOrderId: null,
          lineItemId: null,
          entityStatus: 'ACTIVE',
        },
      ];

      res.json(entities);
    } else {
      const entities = [
        {
          name: 'My Insertion Order 1',
          partnerId: '2015636',
          advertiserId: '123',
          insertionOrderId: '135',
          lineItemId: null,
          entityStatus: 'ACTIVE',
        },
      ];

      res.json(entities);
    }
  }
}

export default new SomeController();
