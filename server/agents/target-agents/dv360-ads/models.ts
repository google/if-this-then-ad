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

import { ApiCallParams } from './interfaces';

export interface DV360Entity {
  apiConfig: ApiCallParams;
  listName: string;
}

/**
 * DV360 Partner.
 */
export class Partner implements DV360Entity {
  apiConfig = {
    url: '/partners',
  };
  listName = 'partners';
}

/**
 * DV360 Advertiser.
 */
export class Advertiser implements DV360Entity {
  apiConfig = {
    url: '/advertisers',
    params: {
      partnerId: '{partnerId}',
    },
  };
  listName = 'advertisers';
}

/**
 * DV360 Campaign.
 */
export class Campaign implements DV360Entity {
  apiConfig = {
    url: '/advertisers/{advertiserId}/campaigns',
  };
  listName = 'campaigns';
}

/**
 * DV360 Insertion Order.
 */
export class InsertionOrder implements DV360Entity {
  apiConfig = {
    url: '/advertisers/{advertiserId}/insertionOrders',
  };
  listName = 'insertionOrders';
}

/**
 * DV360 Line Item.
 */
export class LineItem implements DV360Entity {
  apiConfig = {
    url: '/advertisers/{advertiserId}/lineItems',
  };
  listName = 'lineItems';
}
