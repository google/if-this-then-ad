/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
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
  CAMPAIGN_LABEL = 'CAMPAIGN_LABEL',
  CAMPAIGN_ID = 'CAMPAIGN_ID',
}

export enum GOOGLE_ADS_ENTITY_STATUS {
  ENABLED = 'ENABLED',
  PAUSED = 'PAUSED',
}

export enum GOOGLE_ADS_ACTION {
  TOGGLE = 'Enable/Pause',
}

interface Parameters {
  customerId: string;
  developerToken: string;
  loginCustomerId?: string;
  serviceAccount?: ServiceAccount;
}

interface Entity {
  resourceName: string;
  status: GOOGLE_ADS_ENTITY_STATUS;
}

export class GoogleAds extends TargetAgent {
  static friendlyName = 'Google Ads';
  authToken?: string;
  parameters: Parameters = {} as Parameters;
  baseUrl: string;
  requiredParameters: Array<keyof Parameters> = [
    'customerId',
    'developerToken',
  ];

  constructor() {
    super();

    this.baseUrl = 'https://googleads.googleapis.com/v18';
  }

  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {GOOGLE_ADS_SELECTOR_TYPE} type
   * @param {GOOGLE_ADS_ACTION} action
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   */
  process(
    identifier: string,
    type: GOOGLE_ADS_SELECTOR_TYPE,
    action: GOOGLE_ADS_ACTION,
    evaluation: boolean,
    params: Parameters
  ) {
    // Check for missing parameters
    this.ensureRequiredParameters(params);

    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    this.parameters = params;

    if (action === GOOGLE_ADS_ACTION.TOGGLE) {
      return this.handleToggle(identifier, type, evaluation, params);
    } else {
      throw new Error(
        `Action '${action}' not supported in '${GoogleAds.friendlyName}' agent`
      );
    }
  }

  /**
   * Handle toggle action
   *
   * @param {string} identifier
   * @param {GOOGLE_ADS_SELECTOR_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   */
  handleToggle(
    identifier: string,
    type: GOOGLE_ADS_SELECTOR_TYPE,
    evaluation: boolean,
    params: Parameters
  ) {
    console.log(`Identifier type = ${typeof identifier}`);

    const status = evaluation
      ? GOOGLE_ADS_ENTITY_STATUS.ENABLED
      : GOOGLE_ADS_ENTITY_STATUS.PAUSED;

    if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_ID) {
      console.log(`Updating status of Ad ${identifier} to '${status}'`);
      this.updateAdStatusById(
        params.customerId,
        identifier.split(';').map(id => String(id)),
        status
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_LABEL) {
      this.updateAdStatusByLabel(params.customerId, identifier, status);
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_ID) {
      this.updateAdGroupStatusById(
        params.customerId,
        identifier.split(';').map(id => String(id)),
        status
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_LABEL) {
      console.log(
        `Updating status of AdGroup by label '${identifier}' to '${status}'`
      );
      this.updateAdGroupStatusByLabel(params.customerId, identifier, status);
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.CAMPAIGN_ID) {
      this.updateCampaignStatusById(
        params.customerId,
        (identifier as string).split(';').map(id => String(id)),
        status
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.CAMPAIGN_LABEL) {
      this.updateCampaignsByLabel(params.customerId, identifier, status);
    }
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {GOOGLE_ADS_SELECTOR_TYPE} type
   * @param {GOOGLE_ADS_ACTION} action
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   * @returns {string[]}
   */
  validate(
    identifier: string,
    type: GOOGLE_ADS_SELECTOR_TYPE,
    action: GOOGLE_ADS_ACTION,
    evaluation: boolean,
    params: Parameters
  ) {
    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    this.parameters = params;

    const expectedStatus = evaluation
      ? GOOGLE_ADS_ENTITY_STATUS.ENABLED
      : GOOGLE_ADS_ENTITY_STATUS.PAUSED;
    let entitiesToBeChecked: Entity[] = [];
    const errors: string[] = [];

    if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_ID) {
      entitiesToBeChecked = entitiesToBeChecked.concat(
        this.getAdsById(
          params.customerId,
          identifier.split(',').map(id => String(id))
        )
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_LABEL) {
      entitiesToBeChecked = entitiesToBeChecked.concat(
        this.getAdsByLabel(params.customerId, identifier)
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_ID) {
      entitiesToBeChecked = entitiesToBeChecked.concat(
        this.getAdGroupsById(
          params.customerId,
          identifier.split(',').map(id => String(id))
        )
      );
    } else if (type === GOOGLE_ADS_SELECTOR_TYPE.AD_GROUP_LABEL) {
      entitiesToBeChecked = entitiesToBeChecked.concat(
        this.getAdGroupsByLabel(params.customerId, identifier)
      );
    }

    for (const entity of entitiesToBeChecked) {
      if (entity.status !== expectedStatus) {
        errors.push(
          `Status for ${identifier} (${type}) should be ${expectedStatus} but is ${entity.status}`
        );
      }
    }

    return errors;
  }

  /**
   * Update entity status.
   *
   * @param {string} path
   * @param {Entity} entity
   * @param {string} status
   */
  private updateEntityStatus(path: string, entity: Entity, status: string) {
    const payload = {
      operations: [
        {
          updateMask: 'status',
          update: {
            resourceName: entity.resourceName,
            status: status,
          },
        },
      ],
    };

    this.fetchUrl(path, 'POST', payload);
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
  private fetchUrl(
    path: string,
    method = 'get',
    payload: Object,
    forceCache = false
  ) {
    const headers: GoogleAppsScript.URL_Fetch.HttpHeaders = {
      Authorization: `Bearer ${this.authToken}`,
      Accept: '*/*',
      'developer-token': this.parameters.developerToken ?? '',
    };

    if (this.parameters.loginCustomerId) {
      headers['login-customer-id'] = String(this.parameters.loginCustomerId);
    }

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
   * @param {string[]} ids
   * @param {string} status
   */
  private updateAdStatusById(
    customerId: string,
    ids: string[],
    status: string
  ) {
    const ads = this.getAdsById(customerId, ids);
    const path = `customers/${customerId}/adGroupAds:mutate`;

    for (const ad of ads) {
      this.updateEntityStatus(path, ad, status);
    }
  }

  /**
   * Update AdGroup status by ID(s).
   *
   * @param {string} customerId
   * @param {string[]} ids
   * @param {string} status
   */
  private updateAdGroupStatusById(
    customerId: string,
    ids: string[],
    status: string
  ) {
    const adGroups = this.getAdGroupsById(customerId, ids);
    const path = `customers/${customerId}/adGroups:mutate`;

    for (const adGroup of adGroups) {
      this.updateEntityStatus(path, adGroup, status);
    }
  }

  /**
   * Updates a campaign's status by its ID.
   *
   * @param {string} customerId
   * @param {string[]} ids
   * @param {string} status
   */
  private updateCampaignStatusById(
    customerId: string,
    ids: string[],
    status: string
  ) {
    const query = `
      SELECT 
        campaign.id,
        campaign.status
      FROM campaign
      WHERE 
        campaign.id IN (${ids.join(',')})
    `;

    const campaigns = this.getEntitiesByQuery(customerId, query, 'campaign');

    const path = `customers/${customerId}/campaigns:mutate`;
    for (const campaign of campaigns) {
      this.updateEntityStatus(path, campaign, status);
    }
  }

  /**
   * Update Ad status by label.
   *
   * @param {string} customerId
   * @param {string} label
   * @param {string} status
   */
  private updateAdStatusByLabel(
    customerId: string,
    label: string,
    status: string
  ) {
    const ads = this.getAdsByLabel(customerId, label);
    const path = `customers/${customerId}/adGroupAds:mutate`;

    for (const ad of ads) {
      this.updateEntityStatus(path, ad, status);
    }
  }

  /**
   * Update AdGroup status by label.
   *
   * @param {string} customerId
   * @param {string} label
   * @param {string} status
   */
  private updateAdGroupStatusByLabel(
    customerId: string,
    label: string,
    status: string
  ) {
    const adGroups = this.getAdGroupsByLabel(customerId, label);

    const path = `customers/${customerId}/adGroups:mutate`;

    for (const adGroup of adGroups) {
      this.updateEntityStatus(path, adGroup, status);
    }
  }

  /**
   * Finds and updates the campaigns with the provided label.
   *
   * @param customerId
   * @param label
   * @param status
   */
  private updateCampaignsByLabel(
    customerId: string,
    label: string,
    status: string
  ) {
    const campaigns = this.getCampaignsByLabel(customerId, label);

    const path = `customers/${customerId}/campaigns:mutate`;
    for (const campaign of campaigns) {
      this.updateEntityStatus(path, campaign, status);
    }
  }

  /**
   * Get Ads status by ID(s).
   *
   * @param {string} customerId
   * @param {string[]} ids
   * @returns {string[]}
   */
  private getAdsById(customerId: string, ids: string[]): Entity[] {
    const query = `
        SELECT 
          ad_group_ad.ad.id,
          ad_group_ad.status
        FROM ad_group_ad
        WHERE 
          ad_group_ad.ad.id IN (${ids.join(',')})
      `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'adGroupAd', Entity>>;
    };

    return res.results.map(result => {
      return {
        resourceName: result.adGroupAd.resourceName,
        status: result.adGroupAd.status,
      };
    });
  }

  /**
   * Get AdGroups status by ID(s).
   *
   * @param {string} customerId
   * @param {string[]} ids
   * @returns {Entity[]}
   */
  private getAdGroupsById(customerId: string, ids: string[]): Entity[] {
    const query = `
          SELECT 
            ad_group.id,
            ad_group.status
          FROM ad_group
          WHERE 
            ad_group.id IN (${ids.join(',')})
        `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'adGroup', Entity>>;
    };

    return res.results.map(result => {
      return {
        resourceName: result.adGroup.resourceName,
        status: result.adGroup.status,
      };
    });
  }

  /**
   * Retrieves an Ads entity using the provided query.
   *
   * @param {string} customerId Account ID to execute the query in.
   * @param {string} query GAQL query to execute.
   * @param {string} entityName Name of the ads entity in the query result set.
   * @returns {Entity[]} Entities found by the query.
   */
  private getEntitiesByQuery(
    customerId: string,
    query: string,
    entityName: string
  ): Entity[] {
    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<string, Entity>>;
    };

    return res.results.map(result => {
      return {
        resourceName: result[entityName].resourceName,
        status: result[entityName]?.status,
      } as Entity;
    });
  }

  /**
   * Get Ads resource names by labels.
   *
   * @param {string} customerId
   * @param {string} label
   * @returns {Entity[]}
   */
  private getAdsByLabel(customerId: string, label: string): Entity[] {
    const labelResource = this.getAdLabelByName(customerId, label);

    const query = `
      SELECT 
        ad_group_ad.ad.id,
        ad_group_ad.status
      FROM ad_group_ad
      WHERE 
        ad_group_ad.labels CONTAINS ANY ('${labelResource}')
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'adGroupAd', Entity>>;
    };

    return res.results.map(result => {
      return {
        resourceName: result.adGroupAd.resourceName,
        status: result.adGroupAd.status,
      };
    });
  }

  /**
   * Get Ad label by name.
   *
   * @param {string} customerId
   * @param {string} labelName
   * @returns {string}
   */
  private getAdLabelByName(customerId: string, labelName: string) {
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
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'label', Entity>>;
    };

    if (!(res.results && res.results.length)) {
      throw new Error(`Label ${labelName} not found`);
    }

    return res.results[0].label.resourceName;
  }

  /**
   * Get AdGroups resource names by labels.
   *
   * @param {string} customerId
   * @param {string} label
   * @returns {Entity[]}
   */
  private getAdGroupsByLabel(customerId: string, label: string): Entity[] {
    const labelResource = this.getAdGroupLabelByName(customerId, label);

    const query = `
      SELECT 
        ad_group.id,
        ad_group.status
      FROM ad_group 
      WHERE 
        ad_group.labels CONTAINS ANY ('${labelResource}')
    `;

    const payload = {
      query,
    };

    const path = `customers/${customerId}/googleAds:search`;
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'adGroup', Entity>>;
    };

    return res.results.map(result => {
      return {
        resourceName: result.adGroup.resourceName,
        status: result.adGroup.status,
      };
    });
  }

  /**
   * Get AdGroup label by name.
   *
   * @param {string} customerId
   * @param {string} labelName
   * @returns {string}
   */
  private getAdGroupLabelByName(customerId: string, labelName: string) {
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
    const res = this.fetchUrl(path, 'POST', payload, true) as {
      results: Array<Record<'label', Entity>>;
    };

    if (!(res.results && res.results.length)) {
      throw new Error(`Label ${labelName} not found`);
    }

    return res.results[0].label.resourceName;
  }

  /**
   * Retrieves 1 or more campaigns with the provided label.
   *
   * @param {string} customerId
   * @param {string} label
   * @returns {Entity[]}
   */
  private getCampaignsByLabel(customerId: string, label: string): Entity[] {
    const labelResource = this.getCampaignLabelResourceByName(
      customerId,
      label
    );

    const query = `
      SELECT 
        campaign.id,
        campaign.status
      FROM campaign 
      WHERE 
        campaign.labels CONTAINS ANY ('${labelResource}')
    `;

    return this.getEntitiesByQuery(customerId, query, 'campaign');
  }

  /**
   * Retrieves the campaign label resource name for the provided label name.
   *
   * @param customerId
   * @param labelName
   */
  private getCampaignLabelResourceByName(
    customerId: string,
    labelName: string
  ): string {
    const query = `
      SELECT
        label.resource_name,
        label.status
      FROM label
      WHERE 
        label.name = '${labelName}'
    `;

    const campaignLabels = this.getEntitiesByQuery(customerId, query, 'label');
    return campaignLabels[0].resourceName;
  }
}
