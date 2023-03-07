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

import { Auth } from '../helpers/auth';
import { TargetAgent } from './base';

export enum DV360_ENTITY_STATUS {
  ACTIVE = 'ENTITY_STATUS_ACTIVE',
  PAUSED = 'ENTITY_STATUS_PAUSED',
}

export enum DV360_ENTITY_TYPE {
  LINE_ITEM = 'LINE_ITEM',
  INSERTION_ORDER = 'INSERTION_ORDER',
}

interface Entity {
  entityStatus: DV360_ENTITY_STATUS;
}

interface Parameters {
  advertiserId: string;
  serviceAccount?: string;
}

/**
 * DV360 API Wrapper class. Implements DV360 API calls.
 */
export class DV360 extends TargetAgent {
  static friendlyName = 'DV360';
  authToken?: string;
  baseUrl: string;
  requiredParameters = ['advertiserId'];

  /**
   * Set the DV360 wrapper configuration
   */
  constructor() {
    super();

    /**
     * DV360 Write API Endpoint Prefix
     * See more: https://developers.google.com/display-video/api/reference/rest
     */
    this.baseUrl = 'https://displayvideo.googleapis.com/v1';
  }

  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {DV360_ENTITY_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   */
  process(
    identifier: string,
    type: DV360_ENTITY_TYPE,
    evaluation: boolean,
    params: Parameters
  ) {
    // Check for missing parameters
    this.ensureRequiredParameters(params);

    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
      this.switchLineItemStatus(params.advertiserId, identifier, evaluation);
    } else if (type === DV360_ENTITY_TYPE.INSERTION_ORDER) {
      this.switchInsertionOrderStatus(
        params.advertiserId,
        identifier,
        evaluation
      );
    }
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {DV360_ENTITY_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   * @returns {Array<string>}
   */
  validate(
    identifier: string,
    type: DV360_ENTITY_TYPE,
    evaluation: boolean,
    params: Parameters
  ) {
    // Check for missing parameters
    this.ensureRequiredParameters(params);

    const auth = new Auth(params.serviceAccount ?? undefined);
    this.authToken = auth.getAuthToken();

    let status;
    const errors = [];

    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
      status = this.isLineItemActive(params.advertiserId, identifier);
    } else if (type === DV360_ENTITY_TYPE.INSERTION_ORDER) {
      status = this.isInsertionOrderActive(params.advertiserId, identifier);
    }

    if (evaluation !== status) {
      errors.push(
        `Status for ${identifier} (${type}) should be ${evaluation} but is ${status}`
      );
    }

    return errors;
  }

  /**
   * Make an HTTP API request to the DV360 API.
   *
   * @param {string} url - API endpoint to be requested
   * @param {string?} method - HTTP method, e.g. GET, PATCH, etc.
   * @param {Object|undefined} payload - What should be updated
   * @returns {JSON} Result of the operation
   */
  private fetchUrl(url: string, method = 'get', payload?: Object | undefined) {
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      Accept: '*/*',
    };

    return this.callApi(url, headers, undefined, payload, method);
  }

  /**
   * Change DV360 entity status (Active/Paused) for the specified ID.
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.lineItems
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.insertionOrders
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} entityId DV360 Line Item/Insertion Order ID
   * @param {boolean} turnOn Activate on 'true', deactivate on 'false'
   * @param {string} entity
   */
  private switchEntityStatus(
    advertiserId: string,
    entityId: string,
    turnOn: boolean,
    entity: string
  ) {
    const newStatus = turnOn
      ? DV360_ENTITY_STATUS.ACTIVE
      : DV360_ENTITY_STATUS.PAUSED;
    const updateMask = {
      entityStatus: newStatus,
    };

    const url = `${this.baseUrl}/advertisers/${advertiserId}/${entity}/${entityId}?updateMask=entityStatus`;

    this.fetchUrl(url, 'patch', updateMask);

    console.log(
      `* [DV360:switch ${entity}]: DONE, ID: ${entityId} new status ${newStatus}`
    );
  }

  /**
   * Change Line Item status (Active/Paused) for the specified LI ID.
   *
   * @param {string} advertiserId - DV360 Advertiser ID
   * @param {string} lineItemId - DV360 Line Item ID
   * @param {boolean} turnOn - Activate LI on 'true', deactivate on 'false'
   */
  private switchLineItemStatus(
    advertiserId: string,
    lineItemId: string,
    turnOn: boolean
  ) {
    const newStatus = this.switchEntityStatus(
      advertiserId,
      lineItemId,
      turnOn,
      'lineItems'
    );
  }

  /**
   * Change Insertion Order status (Active/Paused) for the specified IO ID.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} insertionOrderId DV360 Line Item ID
   * @param {boolean} turnOn Activate IO on 'true', deactivate on 'false'
   */
  private switchInsertionOrderStatus(
    advertiserId: string,
    insertionOrderId: string,
    turnOn: boolean
  ) {
    this.switchEntityStatus(
      advertiserId,
      insertionOrderId,
      turnOn,
      'insertionOrders'
    );
  }

  /**
   * Get DV360 entity for the specified ID.
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.lineItems
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.insertionOrders
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} entityId DV360 Line Item/Insertion Order ID
   * @param {string} entity Entity (e.g. lineItems/insertionOrders), see API refernece
   * @returns {Entity} Entity object
   */
  private getEntity(
    advertiserId: string,
    entityId: string,
    entity: string
  ): Entity {
    const url = `${this.baseUrl}/advertisers/${advertiserId}/${entity}/${entityId}`;

    return this.fetchUrl(url) as Entity;
  }

  /**
   * Return true if the entity is active else false.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} lineItemId DV360 Line Item ID
   * @returns {boolean}
   */
  private isLineItemActive(advertiserId: string, lineItemId: string) {
    const entity = this.getEntity(advertiserId, lineItemId, 'lineItems');

    return DV360_ENTITY_STATUS.ACTIVE == entity.entityStatus;
  }

  /**
   * Return true if the entity is active else false.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} insertionOrderId DV360 Insertion Order ID
   * @returns {boolean}
   */
  private isInsertionOrderActive(
    advertiserId: string,
    insertionOrderId: string
  ) {
    const entity = this.getEntity(
      advertiserId,
      insertionOrderId,
      'insertionOrders'
    );

    return DV360_ENTITY_STATUS.ACTIVE == entity.entityStatus;
  }
}
