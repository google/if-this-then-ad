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

<<<<<<< HEAD
<<<<<<< HEAD
export enum DV360_ENTITY_STATUS {
=======
enum DV360_ENTITY_STATUS {
>>>>>>> 1a33360 (Built IFTTA v2)
=======
export enum DV360_ENTITY_STATUS {
>>>>>>> 4fbdb4b (Added tests and removed debug code)
  ACTIVE = 'ENTITY_STATUS_ACTIVE',
  PAUSED = 'ENTITY_STATUS_PAUSED',
}

<<<<<<< HEAD
<<<<<<< HEAD
export enum DV360_ENTITY_TYPE {
=======
enum DV360_ENTITY_TYPE {
>>>>>>> 1a33360 (Built IFTTA v2)
=======
export enum DV360_ENTITY_TYPE {
>>>>>>> 4fbdb4b (Added tests and removed debug code)
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
<<<<<<< HEAD
<<<<<<< HEAD
  requiredParameters = ['advertiserId'];
=======
  requiredParameters = ['id', 'type', 'advertiserId'];
>>>>>>> 1a33360 (Built IFTTA v2)
=======
  requiredParameters = ['advertiserId'];
>>>>>>> 4fbdb4b (Added tests and removed debug code)

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

<<<<<<< HEAD
<<<<<<< HEAD
    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
      this.setLineItemStatus(params.advertiserId, identifier, evaluation);
    } else if (type === DV360_ENTITY_TYPE.INSERTION_ORDER) {
      this.setInsertionOrderStatus(params.advertiserId, identifier, evaluation);
=======
    console.log('Switching', identifier, type, evaluation);

=======
>>>>>>> 0183214 (Improved validation log output)
    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
      this.switchLIStatus_(params.advertiserId, identifier, evaluation);
    } else if (type === DV360_ENTITY_TYPE.INSERTION_ORDER) {
<<<<<<< HEAD
      this.switchIOStatus(params.advertiserId, identifier, evaluation);
>>>>>>> 1a33360 (Built IFTTA v2)
=======
      this.switchIOStatus_(params.advertiserId, identifier, evaluation);
>>>>>>> 4fbdb4b (Added tests and removed debug code)
    }
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {DV360_ENTITY_TYPE} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
<<<<<<< HEAD
<<<<<<< HEAD
   * @returns {string[]}
=======
   * @throws {Error}
>>>>>>> 1a33360 (Built IFTTA v2)
=======
   * @returns {Array<string>}
>>>>>>> 0183214 (Improved validation log output)
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
<<<<<<< HEAD
<<<<<<< HEAD
    const errors = [];

    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
<<<<<<< HEAD
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
=======
=======
    const errors = [];
>>>>>>> 0183214 (Improved validation log output)

    if (type === DV360_ENTITY_TYPE.LINE_ITEM) {
      status = this.isLIActive(params.advertiserId, identifier);
=======
      status = this.isLIActive_(params.advertiserId, identifier);
>>>>>>> 4fbdb4b (Added tests and removed debug code)
    } else if (type === DV360_ENTITY_TYPE.INSERTION_ORDER) {
      status = this.isIOActive_(params.advertiserId, identifier);
    }

    if (evaluation !== status) {
      errors.push(
        `Status for ${identifier} (${type}) should be ${evaluation} but is ${status}`
      );
    }
<<<<<<< HEAD
>>>>>>> 1a33360 (Built IFTTA v2)
=======

    return errors;
>>>>>>> 0183214 (Improved validation log output)
  }

  /**
   * Make an HTTP API request to the DV360 API.
   *
   * @param {string} url - API endpoint to be requested
   * @param {string?} method - HTTP method, e.g. GET, PATCH, etc.
   * @param {Object|undefined} payload - What should be updated
   * @returns {JSON} Result of the operation
   */
  private fetchUrl_(url: string, method = 'get', payload?: Object | undefined) {
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
<<<<<<< HEAD
   * @param {boolean} status Activate on 'true', deactivate on 'false'
   * @param {string} entity
   */
  private setEntityStatus(
    advertiserId: string,
    entityId: string,
    status: boolean,
    entity: string
  ) {
    const newStatus = status
=======
   * @param {boolean} turnOn Activate on 'true', deactivate on 'false'
   * @param {string} entity
   */
  private switchEntityStatus_(
    advertiserId: string,
    entityId: string,
    turnOn: boolean,
    entity: string
  ) {
    const newStatus = turnOn
>>>>>>> 1a33360 (Built IFTTA v2)
      ? DV360_ENTITY_STATUS.ACTIVE
      : DV360_ENTITY_STATUS.PAUSED;
    const updateMask = {
      entityStatus: newStatus,
    };

    const url = `${this.baseUrl}/advertisers/${advertiserId}/${entity}/${entityId}?updateMask=entityStatus`;

    this.fetchUrl_(url, 'patch', updateMask);

<<<<<<< HEAD
<<<<<<< HEAD
    console.log(
=======
    Logger.log(
>>>>>>> 1a33360 (Built IFTTA v2)
=======
    console.log(
>>>>>>> 4fbdb4b (Added tests and removed debug code)
      `* [DV360:switch ${entity}]: DONE, ID: ${entityId} new status ${newStatus}`
    );
  }

  /**
<<<<<<< HEAD
<<<<<<< HEAD
   * Change Line Item status (Active/Paused) for the specified LI ID.
   *
   * @param {string} advertiserId - DV360 Advertiser ID
   * @param {string} lineItemId - DV360 Line Item ID
   * @param {boolean} turnOn - Activate LI on 'true', deactivate on 'false'
   */
  private setLineItemStatus(
    advertiserId: string,
    lineItemId: string,
    turnOn: boolean
  ) {
    const newStatus = this.setEntityStatus(
      advertiserId,
      lineItemId,
      turnOn,
      'lineItems'
    );
  }

  /**
=======
>>>>>>> 1a33360 (Built IFTTA v2)
   * Change Insertion Order status (Active/Paused) for the specified IO ID.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} insertionOrderId DV360 Line Item ID
   * @param {boolean} turnOn Activate IO on 'true', deactivate on 'false'
   */
<<<<<<< HEAD
  private setInsertionOrderStatus(
=======
  private switchIOStatus(
>>>>>>> 1a33360 (Built IFTTA v2)
    advertiserId: string,
    insertionOrderId: string,
    turnOn: boolean
  ) {
<<<<<<< HEAD
    this.setEntityStatus(
=======
    this.switchEntityStatus(
>>>>>>> 1a33360 (Built IFTTA v2)
      advertiserId,
      insertionOrderId,
      turnOn,
      'insertionOrders'
    );
  }

  /**
<<<<<<< HEAD
=======
=======
>>>>>>> 4fbdb4b (Added tests and removed debug code)
   * Change Line Item status (Active/Paused) for the specified LI ID.
   *
   * @param {string} advertiserId - DV360 Advertiser ID
   * @param {string} lineItemId - DV360 Line Item ID
   * @param {boolean} turnOn - Activate LI on 'true', deactivate on 'false'
   */
  private switchLIStatus_(
    advertiserId: string,
    lineItemId: string,
    turnOn: boolean
  ) {
    const newStatus = this.switchEntityStatus_(
      advertiserId,
      lineItemId,
      turnOn,
      'lineItems'
    );
  }

  /**
<<<<<<< HEAD
>>>>>>> 1a33360 (Built IFTTA v2)
=======
   * Change Insertion Order status (Active/Paused) for the specified IO ID.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} insertionOrderId DV360 Line Item ID
   * @param {boolean} turnOn Activate IO on 'true', deactivate on 'false'
   */
  private switchIOStatus_(
    advertiserId: string,
    insertionOrderId: string,
    turnOn: boolean
  ) {
    this.switchEntityStatus_(
      advertiserId,
      insertionOrderId,
      turnOn,
      'insertionOrders'
    );
  }

  /**
>>>>>>> 4fbdb4b (Added tests and removed debug code)
   * Get DV360 entity for the specified ID.
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.lineItems
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.insertionOrders
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} entityId DV360 Line Item/Insertion Order ID
   * @param {string} entity Entity (e.g. lineItems/insertionOrders), see API refernece
   * @returns {Entity} Entity object
   */
  private getEntity_(
    advertiserId: string,
    entityId: string,
    entity: string
  ): Entity {
    const url = `${this.baseUrl}/advertisers/${advertiserId}/${entity}/${entityId}`;

<<<<<<< HEAD
    return this.fetchUrl(url) as Entity;
  }

  /**
<<<<<<< HEAD
=======
   * Get DV360 entity for the specified ID.
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.lineItems
   * See more: https://developers.google.com/display-video/api/reference/rest/v1/advertisers.insertionOrders
   *
   * @param {number} advertiserId DV360 Advertiser ID
   * @param {number} entityId DV360 Line Item/Insertion Order ID
   * @param {string} entity Entity (e.g. lineItems/insertionOrders), see API refernece
   * @returns {DV360_ENTITY_STATUS} Entity status
   */
  private getEntityStatus(
    advertiserId: string,
    entityId: string,
    entity: string
  ): DV360_ENTITY_STATUS {
    const e = this.getEntity(advertiserId, entityId, entity);
    return e.entityStatus;
=======
    return this.fetchUrl_(url) as Entity;
>>>>>>> 4fbdb4b (Added tests and removed debug code)
  }

  /**
>>>>>>> 1a33360 (Built IFTTA v2)
   * Return true if the entity is active else false.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} lineItemId DV360 Line Item ID
   * @returns {boolean}
   */
<<<<<<< HEAD
<<<<<<< HEAD
  private isLineItemActive(advertiserId: string, lineItemId: string) {
    const entity = this.getEntity(advertiserId, lineItemId, 'lineItems');

    return DV360_ENTITY_STATUS.ACTIVE == entity.entityStatus;
=======
  private isLIActive(advertiserId: string, lineItemId: string) {
    return (
      DV360_ENTITY_STATUS.ACTIVE ==
      this.getEntityStatus(advertiserId, lineItemId, 'lineItems')
    );
>>>>>>> 1a33360 (Built IFTTA v2)
=======
  private isLIActive_(advertiserId: string, lineItemId: string) {
    const entity = this.getEntity_(advertiserId, lineItemId, 'lineItems');

    return DV360_ENTITY_STATUS.ACTIVE == entity.entityStatus;
>>>>>>> 4fbdb4b (Added tests and removed debug code)
  }

  /**
   * Return true if the entity is active else false.
   *
   * @param {string} advertiserId DV360 Advertiser ID
   * @param {string} insertionOrderId DV360 Insertion Order ID
   * @returns {boolean}
   */
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
  private isIOActive(advertiserId: string, insertionOrderId: string) {
    return (
      DV360_ENTITY_STATUS.ACTIVE ==
      this.getEntityStatus(advertiserId, insertionOrderId, 'insertionOrders')
    );
>>>>>>> 1a33360 (Built IFTTA v2)
=======
  private isIOActive_(advertiserId: string, insertionOrderId: string) {
    const entity = this.getEntity_(
      advertiserId,
      insertionOrderId,
      'insertionOrders'
    );

    return DV360_ENTITY_STATUS.ACTIVE == entity.entityStatus;
>>>>>>> 4fbdb4b (Added tests and removed debug code)
  }
}
