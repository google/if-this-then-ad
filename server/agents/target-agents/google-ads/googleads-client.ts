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

import {
  AdGroup,
  EntityStatus,
  HttpMethods,
  AdGroupOperation,
  MutateOperation,
  AdGroupObject,
} from './interfaces';
import axios, { AxiosRequestConfig, Method } from 'axios';
import { logger } from '../../../util/logger';
import { config } from './config';

/**
 * Class GoogleAdsClient
 *
 * Facilitate calls to the Google Ads API.
 */
export default class GoogleAdsClient {
  /**
   * @param {string} customerAccountId - Ads account to operate on
   * @param {string} managerAccountId - Manager account from which to operate
   * @param {string} oauthToken - OAuth token authorising this access
   * @param {string} developerToken - developer token to use
   */
  constructor(
    private customerAccountId: string,
    private managerAccountId: string,
    private oauthToken: string,
    private developerToken: string
  ) {
    if (
      !oauthToken ||
      !customerAccountId ||
      !managerAccountId ||
      !developerToken
    ) {
      throw new Error('Incomplete configuration for Google Ads API.');
    }
  }

  /**
   * Make a call to the Google Ads API.
   *
   * @param {AxiosRequestConfig} options - options for HTTP call
   * @param {Method} httpMethod - HTTP method to use
   * @returns {Object} - API response
   */
  private async apiCall(
    options: AxiosRequestConfig,
    httpMethod: Method = HttpMethods.POST
  ): Promise<any> {
    options.headers = {
      'developer-token': this.developerToken,
      'login-customer-id': parseInt(this.managerAccountId),
      Authorization: `Bearer ${this.oauthToken}`,
    };
    options.method = httpMethod;
    try {
      const result = await axios(options);
      if (result.status == 200) {
        return result.data;
      }
      return Promise.reject(result.statusText);
    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Sends HTTP request to Google Ads api.
   * and returns the query result.
   * @param {string} query
   * @returns {Promise<any>} http result
   */
  private async queryAdsApi(query): Promise<any> {
    return this.apiCall(
      {
        url: `${config.baseUrl}/customers/${this.customerAccountId}/googleAds:search`,
        data: { query: query },
      },
      HttpMethods.POST
    );
  }

  /**
   * Compose Update Object to send to Ads Api.
   *
   * @param {string} entityId AdGroup Id
   * @param {string} updateMask
   * @param {object} field Object to update
   * @returns {MutateOperation}
   */
  private makeUpdateOperation(
    entityId: string,
    updateMask: string,
    field: object
  ): MutateOperation {
    const adGroup: AdGroupObject = {
      resourceName: `customers/${this.customerAccountId}/adGroups/${entityId}`,
      ...field,
    };
    const updateOperation: AdGroupOperation = {
      updateMask: updateMask,
      update: adGroup,
    };
    return {
      operations: [updateOperation],
    };
  }

  /**
   * Update the AdGroup.
   *
   * @param {string} entityId AdGroup Id
   * @param {boolean} activate
   * @returns {Promise<any>}
   */
  public async updateAdGroup(
    entityId: string,
    activate: boolean
  ): Promise<any> {
    const _data = this.makeUpdateOperation(entityId, 'status', {
      status: activate ? EntityStatus.ACTIVE : EntityStatus.PAUSED,
    });
    return this.apiCall(
      {
        url: `${config.baseUrl}/customers/${this.customerAccountId}/adGroups:mutate`,
        data: _data,
      },
      HttpMethods.POST
    );
  }

  /**
   * Fetche available Ad Groups from the customer account.
   *
   * @param {boolean} active
   * @returns {Promise<AdGroup[]>} Array of AdGroups
   */
  public async listAdGroups(active = false): Promise<AdGroup[]> {
    let query = `SELECT ad_group.name,
                        campaign.id,
                        campaign.name,
                        ad_group.id,
                        ad_group.name,
                        ad_group.status,
                        ad_group.type
                    FROM ad_group
                    WHERE ad_group.status != 'REMOVED'`;
    if (active) {
      query += ` AND campaign.status = 'ENABLED' AND ad_group.status = 'ENABLED'`;
    }
    try {
      const httpResult = await this.queryAdsApi(query);
      return httpResult.results.map((res) => {
        const adGroup: AdGroup = {
          customerId: this.customerAccountId,
          campaignId: res.campaign.id,
          campaignName: res.campaign.name,
          id: res.adGroup.id,
          name: res.adGroup.name,
          type: res.adGroup.type,
          status: res.adGroup.status,
        };
        return adGroup;
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Get ad group by id.
   *
   * @param {string} id
   * @returns {Promise<AdGroup>}
   */
  public async getAdGroupById(id: string): Promise<AdGroup> {
    const query = `SELECT ad_group.name,
                            campaign.id,
                            campaign.name,
                            ad_group.name,
                            ad_group.id,
                            ad_group.status,
                            ad_group.type
                        FROM ad_group
                        WHERE ad_group.status != 'REMOVED' AND ad_group.id =${id}`;

    try {
      const httpResult = await this.queryAdsApi(query);
      return httpResult.results.map((res) => {
        const adGroup: AdGroup = {
          customerId: this.customerAccountId,
          campaignId: res.campaign.id,
          campaignName: res.campaign.name,
          id: res.adGroup.id,
          name: res.adGroup.name,
          type: res.adGroup.type,
          status: res.adGroup.status,
        };
        return adGroup;
      });
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }
}
