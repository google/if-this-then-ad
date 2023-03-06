/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Auth, ServiceAccount } from '../helpers/auth';
import { TargetAgent } from './base';

export enum GOOGLE_ADS_SELECTOR_TYPE {
  AD_ID = 'AD_ID',
  AD_LABEL = 'AD_LABEL',
  AD_GROUP_ID = 'AD_GROUP_ID',
  AD_GROUP_LABEL = 'AD_GROUP_LABEL',
}

enum GOOGLE_ADS_ENTITY_STATUS {
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
}

interface Parameters {
  customerId: string;
  developerToken: string;
  serviceAccount?: ServiceAccount;
}

export class GoogleAds extends TargetAgent {
  static friendlyName = 'Google Ads';
  authToken?: string;
  developerToken?: string;
  baseUrl: string;
  requiredParameters: Array<keyof Parameters> = [
    'customerId',
    'developerToken',
  ];

  constructor() {
    super();

    this.baseUrl = 'https://googleads.googleapis.com/v13';
  }

  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {GOOGLE_ADS_SELECTOR_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   */
  process(
    identifier: string,
    type: GOOGLE_ADS_SELECTOR_TYPE,
    evaluation: boolean,
    params: Parameters
  ) {
    // Check for missing parameters
    this.ensureRequiredParameters(params);

    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    this.developerToken = params.developerToken;

    const status = evaluation
      ? GOOGLE_ADS_ENTITY_STATUS.ENABLED
      : GOOGLE_ADS_ENTITY_STATUS.PAUSED;

    if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_ID) {
      console.log(`Updating status of Ad ${identifier} to '${status}'`);
      this.updateAdStatusById_(
        params.customerId,
        identifier.split(',').map((id) => Number(id)),
        status
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_LABEL) {
      this.updateAdStatusByLabel_(params.customerId, identifier, status);
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_ID) {
      this.updateAdGroupStatusById_(
        params.customerId,
        identifier.split(',').map((id) => Number(id)),
        status
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_LABEL) {
      console.log(
        `Updating status of AdGroup by label '${identifier}' to '${status}'`
      );
      this.updateAdGroupStatusByLabel_(params.customerId, identifier, status);
    }
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {GOOGLE_ADS_SELECTOR_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   * @throws {Error}
   */
  validate(
    identifier: string,
    type: GOOGLE_ADS_SELECTOR_TYPE,
    evaluation: boolean,
    params: Parameters
  ) {
    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    this.developerToken = params.developerToken;
  }

  /**
   * Update entity status.
   *
   * @param {string} path
   * @param {string} resourceName
   * @param {string} status
   */
  private updateEntityStatus_(
    path: string,
    resourceName: string,
    status: string
  ) {
    const payload = {
      operations: [
        {
          updateMask: 'status',
          update: {
            resourceName: resourceName,
            status: status,
          },
        },
      ],
    };

    const res = this.fetchUrl_(path, 'POST', payload);
  }

  /**
   * Make an HTTP API request to the Ads API.
   *
   * @param {string} url - API endpoint to be requested
   * @param {string?} method - HTTP method, e.g. GET, PATCH, etc.
   * @param {Object|undefined} payload - What should be updated
   * @param {boolean} forceCache
   * @returns {JSON} Result of the operation
   */
  private fetchUrl_(
    path: string,
    method = 'get',
    payload: Object,
    forceCache: boolean = false
  ) {
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      Accept: '*/*',
      'developer-token': this.developerToken ?? '',
    };

    const url = `${this.baseUrl}/${path}`;
    return this.callApi(
      url,
      headers,
      undefined,
      payload,
      method,
      undefined,
      forceCache
    );
  }

  /**
   * Update Ad status by ID(s).
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @param {string} status
   */
  private updateAdStatusById_(
    customerId: string,
    ids: Array<number>,
    status: string
  ) {
    const ads = this.getAdsById_(customerId, ids);
    const path = `customers/${customerId}/adGroupAds:mutate`;

    for (const ad of ads) {
      this.updateEntityStatus_(path, ad, status);
    }
  }

  /**
   * Update AdGroup status by ID(s).
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @param {string} status
   */
  private updateAdGroupStatusById_(
    customerId: string,
    ids: Array<number>,
    status: string
  ) {
    const adGroups = this.getAdGroupsById_(customerId, ids);
    const path = `customers/${customerId}/adGroup:mutate`;

    for (const adGroup of adGroups) {
      this.updateEntityStatus_(path, adGroup, status);
    }
  }

  /**
   * Update Ad status by label.
   *
   * @param {string} customerId
   * @param {string} label
   * @param {string} status
   */
  private updateAdStatusByLabel_(
    customerId: string,
    label: string,
    status: string
  ) {
    const ads = this.getAdsByLabel_(customerId, label);
    const path = `customers/${customerId}/adGroupAds:mutate`;

    for (const ad of ads) {
      this.updateEntityStatus_(path, ad, status);
    }
  }

  /**
   * Update AdGroup status by label.
   *
   * @param {string} customerId
   * @param {string} label
   * @param {string} status
   */
  private updateAdGroupStatusByLabel_(
    customerId: string,
    label: string,
    status: string
  ) {
    const adGroups = this.getAdGroupsByLabel_(customerId, label);

    const path = `customers/${customerId}/adGroups:mutate`;

    for (const adGroup of adGroups) {
      this.updateEntityStatus_(path, adGroup, status);
    }
  }

  /**
   * Get Ads status by ID(s).
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @returns {Array<string>}
   */
  getAdsById_(customerId: any, ids: Array<number>): Array<string> {
    const query = `
        SELECT 
          ad_group_ad.ad.id
        FROM ad_group_ad
        WHERE 
          ad_group_ad.ad.id IN (${ids.join(',')})
      `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as Record<
      string,
      Array<Record<string, any>>
    >;

    return res.results.map((result: any) => result.adGroupAd.resourceName);
  }

  /**
   * Get AdGroups status by ID(s).
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @returns {Array<string>}
   */
  private getAdGroupsById_(
    customerId: string,
    ids: Array<number>
  ): Array<string> {
    const query = `
          SELECT 
            ad_group.id
          FROM ad_group
          WHERE 
            ad_group.id IN (${ids.join(',')})
        `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as any;

    return res.results.map((result: any) => result.adGroup.resourceName);
  }

  /**
   * Get Ads resource names by labels.
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @returns {Array<string>}
   */
  private getAdsByLabel_(customerId: any, label: string): Array<string> {
    const labelResource = this.getAdLabelByName_(customerId, label);

    const query = `
      SELECT 
        ad_group_ad.ad.id
      FROM ad_group_ad
      WHERE 
        ad_group_ad.labels CONTAINS ANY ('${labelResource}')
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as any;

    return res.results.map((result: any) => result.adGroupAd.resourceName);
  }

  /**
   * Get Ad label by name.
   *
   * @param {string} customerId
   * @param {string} labelName
   * @returns {string}
   */
  private getAdLabelByName_(customerId: string, labelName: string) {
    const query = `
      SELECT 
        label.resource_name
      FROM ad_group_ad_label 
      WHERE 
        label.name = '${labelName}'
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as any;

    return res.results[0].label.resourceName;
  }

  /**
   * Get AdGroups resource names by labels.
   *
   * @param {string} customerId
   * @param {Array<number>} ids
   * @returns {Array<string>}
   */
  private getAdGroupsByLabel_(customerId: any, label: string): Array<string> {
    const labelResource = this.getAdGroupLabelByName_(customerId, label);

    const query = `
      SELECT 
        ad_group.id
      FROM ad_group 
      WHERE 
        ad_group.labels CONTAINS ANY ('${labelResource}')
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as any;

    return res.results.map((result: any) => result.adGroup.resourceName);
  }

  /**
   * Get AdGroup label by name.
   *
   * @param {string} customerId
   * @param {string} labelName
   * @returns {string}
   */
  private getAdGroupLabelByName_(customerId: string, labelName: string) {
    const query = `
      SELECT 
        label.resource_name
      FROM ad_group_label 
      WHERE 
        label.name = '${labelName}'
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl_(path, 'POST', payload, true) as any;

    return res.results[0].label.resourceName;
  }
}
