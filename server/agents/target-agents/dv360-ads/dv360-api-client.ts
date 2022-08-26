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

import { OAuth2Client } from 'google-auth-library';
import { TargetEntity } from '../../../common/target';

interface ResourceItem {
  displayName: string;
}
interface ResourcePage {
  nextPageToken?: string;
}
interface Dv360Partner extends ResourceItem {
  partnerId: string;
}
interface Dv360PartnerPage extends ResourcePage {
  partners: Dv360Partner[];
}
interface Dv360Advertiser extends ResourceItem {
  partnerId: string;
  advertiserId: string;
}
interface Dv360AdvertiserPage extends ResourcePage {
  advertisers: Dv360Advertiser[];
}
interface Dv360Campaign extends ResourceItem {
  advertiserId: string;
  campaignId: string;
}
interface Dv360CampaignPage extends ResourcePage {
  campaigns: Dv360Campaign[];
}
interface Dv360InsertionOrder extends ResourceItem {
  campaignId: string;
  insertionOrderId: string;
}
interface Dv360InsertionOrderPage extends ResourcePage {
  insertionOrders: Dv360InsertionOrder[];
}
interface Dv360LineItem extends ResourceItem {
  insertionOrderId: string;
  lineItemId: string;
}
interface Dv360LineItemPage extends ResourcePage {
  lineItems: Dv360LineItem[];
}

type TargetEntityStatus = 'ENTITY_STATUS_ACTIVE' | 'ENTITY_STATUS_PAUSED';

const DV360_API_URL = 'https://displayvideo.googleapis.com/v1';
const DV360_PARTNER_FIELDS = 'partners(partnerId,displayName),nextPageToken';
const DV360_ADVERTISER_FIELDS =
  'advertisers(partnerId,advertiserId,displayName),nextPageToken';
const DV360_CAMPAIGN_FIELDS =
  'campaigns(advertiserId,campaignId,displayName),nextPageToken';
const DV360_INSERTION_ORDER_FIELDS =
  'insertionOrders(advertiserId,insertionOrderId,displayName),nextPageToken';
const DV360_LINE_ITEM_FIELDS =
  'lineItems(advertiserId,lineItemId,displayName),nextPageToken';
const DV360_ACTIVE_FILTER = 'entityStatus="ENTITY_STATUS_ACTIVE"';
const DV360_ACTIVE_OR_PAUSED_FILTER = `(${DV360_ACTIVE_FILTER} OR entityStatus="ENTITY_STATUS_PAUSED")`;

/**
 * DV360 API interface for the DV360 agent and directory.
 */
export class Dv360ApiClient {
  /**
   * Constructor.
   * @param {OAuth2Client} oauthClient an OAuth client for authorized API
   *    requests.
   */
  constructor(private readonly oauthClient: OAuth2Client) {}

  /**
   * Fetches a page of resource items from the API.
   * @param {string} url the resource URL
   * @param {Record<string,unknown>} params additional params to customize the
   *    API response
   * @param {string|undefined} pageToken an optional page token to specify a
   *    page to fetch
   * @returns {Promise<T>} a resource page containing the next page token and
   *    the resources
   */
  private async fetchItemsPage<T extends ResourcePage>(
    url: string,
    params: Record<string, unknown>,
    pageToken?: string
  ): Promise<T> {
    const requestParams = { ...params, pageToken };
    const response = await this.oauthClient.request<T>({
      url,
      params: requestParams,
    });
    if (response.status !== 200 || response.data === undefined) {
      throw new Error(`DV360 API client error: ${response.statusText}`);
    }
    return response.data as T;
  }

  /**
   * Fetches all resource items within a specified resource URL.
   * @param {string} url the resource URL
   * @param {Record<string, unknown>} params addition URL parameters to
   *    customize the API response
   * @param {function(page:U): T} resourceSelector a function which retrieves
   *    the resource items from the page
   * @returns {Promise<T[]>} a list of resource items
   */
  private async fetchItems<T extends ResourceItem, U extends ResourcePage>(
    url: string,
    params: Record<string, unknown>,
    resourceSelector: (page: U) => T[]
  ): Promise<T[]> {
    let pageToken: string | undefined;
    let resources: T[] = [];
    do {
      const page = await this.fetchItemsPage<U>(url, params, pageToken);
      const items = resourceSelector(page);
      if (items && items.length) {
        resources = resources.concat(items);
      }
      pageToken = page.nextPageToken;
    } while (pageToken);
    return resources;
  }

  /**
   * Fetches all partners for the authorized user.
   * @returns {Promise<TargetEntity[]>} a list of partner entities
   */
  async listPartners(): Promise<TargetEntity[]> {
    const url = `${DV360_API_URL}/partners`;

    const items = await this.fetchItems<Dv360Partner, Dv360PartnerPage>(
      url,
      {
        filter: DV360_ACTIVE_FILTER,
        fields: DV360_PARTNER_FIELDS,
      },
      (page) => page.partners
    );
    const entities: TargetEntity[] = items.map((item) => ({
      type: 'partner',
      parameters: { partnerId: item.partnerId },
      name: item.displayName,
    }));
    return entities;
  }

  /**
   * Fetches all advertisers for the current user (optionally within the
   * specified partner ID).
   * @param {string} partnerId an optional partner ID filter
   * @returns {Promise<TargetEntity[]>} a list of advertiser entities
   */
  async listAdvertisers(partnerId: string): Promise<TargetEntity[]> {
    const url = `${DV360_API_URL}/advertisers`;
    const items = await this.fetchItems<Dv360Advertiser, Dv360AdvertiserPage>(
      url,
      {
        partnerId,
        filter: DV360_ACTIVE_FILTER,
        fields: DV360_ADVERTISER_FIELDS,
      },
      (page) => page.advertisers
    );
    const entities: TargetEntity[] = items.map((item) => ({
      type: 'advertiser',
      parameters: { partnerId, advertiserId: item.advertiserId },
      name: item.displayName,
    }));
    return entities;
  }

  /**
   * Lists all campaigns under an advertiser.
   * @param {string} advertiserId the advertiser ID for which to list campaigns
   * @returns {Promise<TargetEntity[]>} a list of campaign entities
   */
  async listCampaigns(advertiserId: string): Promise<TargetEntity[]> {
    const url = `${DV360_API_URL}/advertisers/${advertiserId}/campaigns`;
    const items = await this.fetchItems<Dv360Campaign, Dv360CampaignPage>(
      url,
      {
        filter: DV360_ACTIVE_OR_PAUSED_FILTER,
        fields: DV360_CAMPAIGN_FIELDS,
      },
      (page) => page.campaigns
    );
    const entities: TargetEntity[] = items.map((item) => ({
      type: 'campaign',
      parameters: { advertiserId, campaignId: item.campaignId },
      name: item.displayName,
    }));
    return entities;
  }

  /**
   * Lists all line items for the current user and advertiser (optionally also
   * within the specified campaign).
   * @param {string} advertiserId the advertiser ID
   * @param {string} [campaignId] an optional campaign filter
   * @returns {Promise<TargetEntity[]>} a list of insertion order entities
   */
  async listInsertionOrders(
    advertiserId: string,
    campaignId?: string
  ): Promise<TargetEntity[]> {
    const url = `${DV360_API_URL}/advertisers/${advertiserId}/insertionOrders`;

    let filter = DV360_ACTIVE_OR_PAUSED_FILTER;
    if (campaignId) {
      filter = `campaignId=${campaignId} AND ${filter}`;
    }

    const items = await this.fetchItems<
      Dv360InsertionOrder,
      Dv360InsertionOrderPage
    >(
      url,
      {
        fields: DV360_INSERTION_ORDER_FIELDS,
        filter,
      },
      (page) => page.insertionOrders
    );
    const entities: TargetEntity[] = items.map((item) => ({
      type: 'insertionOrder',
      parameters: { advertiserId, insertionOrderId: item.insertionOrderId },
      name: item.displayName,
    }));
    return entities;
  }

  /**
   * Lists all line items for the current user and advertiser (optionally also
   * within the specified campaign or insertion order).
   * @param {string} advertiserId the advertiser ID
   * @param {string} [campaignId] an optional campaign filter
   * @param {string} [insertionOrderId] an optional insertion order filter
   * @returns {Promise<TargetEntity[]>} a list of insertion order entities
   */
  async listLineItems(
    advertiserId: string,
    campaignId?: string,
    insertionOrderId?: string
  ): Promise<TargetEntity[]> {
    const url = `${DV360_API_URL}/advertisers/${advertiserId}/lineItems`;

    let filter = DV360_ACTIVE_OR_PAUSED_FILTER;
    if (insertionOrderId) {
      filter = `insertionOrderId=${insertionOrderId} AND ${filter}`;
    } else if (campaignId) {
      filter = `campaignId=${campaignId} AND ${filter}`;
    }

    const items = await this.fetchItems<Dv360LineItem, Dv360LineItemPage>(
      url,
      {
        fields: DV360_LINE_ITEM_FIELDS,
        filter,
      },
      (page) => page.lineItems
    );
    const entities: TargetEntity[] = items.map((item) => ({
      type: 'lineItem',
      parameters: { advertiserId, lineItemId: item.lineItemId },
      name: item.displayName,
    }));
    return entities;
  }

  /**
   * Modifies a resource item's status
   * @param {string} url the URL for the resource item to modify
   * @param {TargetEntityStatus} status the target status
   * @returns {Promise<void>} completes after the operation
   */
  private async modifyItemStatus(
    url: string,
    status: TargetEntityStatus
  ): Promise<void> {
    const response = await this.oauthClient.request({
      method: 'PATCH',
      url,
      params: { updateMask: 'entityStatus' },
      body: { entityStatus: status },
    });
    if (response.status !== 200) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Modifies a line item's status
   * @param {string} advertiserId the advertiser ID for the line item
   * @param {string} lineItemId the ID of the line item to modify
   * @param {TargetEntityStatus} status the target status
   * @returns {Promise<void>} completes after the operation
   */
  modifyLineItemStatus(
    advertiserId: string,
    lineItemId: string,
    status: TargetEntityStatus
  ): Promise<void> {
    return this.modifyItemStatus(
      `${DV360_API_URL}/advertisers/${advertiserId}/lineItems/${lineItemId}`,
      status
    );
  }

  /**
   * Modifies a insertion order's status
   * @param {string} advertiserId the advertiser ID for the line item
   * @param {string} insertionOrderId the ID of the insertion order to modify
   * @param {TargetEntityStatus} status the target status
   * @returns {Promise<void>} completes after the operation
   */
  modifyInsertionOrderStatus(
    advertiserId: string,
    insertionOrderId: string,
    status: TargetEntityStatus
  ): Promise<void> {
    return this.modifyItemStatus(
      `${DV360_API_URL}/advertisers/${advertiserId}/insertionOrders/${insertionOrderId}`,
      status
    );
  }

  /**
   * Modifies a campaign's status
   * @param {string} advertiserId the advertiser ID for the line item
   * @param {string}campaignId the ID of the campaign to modify
   * @param {TargetEntityStatus} status the target status
   * @returns {Promise<void>} completes after the operation
   */
  modifyCampaignStatus(
    advertiserId: string,
    campaignId: string,
    status: TargetEntityStatus
  ): Promise<void> {
    return this.modifyItemStatus(
      `${DV360_API_URL}/advertisers/${advertiserId}/campaigns/${campaignId}`,
      status
    );
  }
}
