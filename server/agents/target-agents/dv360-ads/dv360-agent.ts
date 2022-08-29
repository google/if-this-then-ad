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

import { OperationResult } from '../../../common/common';
import {
  TargetAgent,
  TargetAgentMetadata,
  TargetAgentTask,
  TargetEntityResponse,
} from '../../../common/target';
import { User } from '../../../common/user';
import { googleAuthService } from '../../../services/google-auth-service';
import { Dv360ApiClient } from './dv360-api-client';

const DV360_AGENT_ID = 'dv360';

/**
 * Target agent implementation for Display & Video 360.
 */
export class Dv360Agent implements TargetAgent {
  readonly id = DV360_AGENT_ID;

  /**
   * Returns an API client authorized for the user.
   * @param {User} user
   * @returns {Dv360ApiClient} the API client with the user's authorization
   */
  private getDv360ApiClient(user: User) {
    const auth = googleAuthService.getAuthorizedClientForUser(user);
    return new Dv360ApiClient(auth);
  }

  /**
   * Executes a single target agent task.
   * @param {TargetAgentTask} task the task
   * @returns {Promise<OperationResult>}the result of the action
   */
  private async executeTask(task: TargetAgentTask): Promise<OperationResult> {
    const client = this.getDv360ApiClient(task.owner);

    const entityType = task.parameters['entityType'];
    const advertiserId = task.parameters['advertiserId'] as string;
    const targetStatus =
      task.action === 'ACTIVATE'
        ? 'ENTITY_STATUS_ACTIVE'
        : 'ENTITY_STATUS_PAUSED';

    try {
      switch (entityType) {
        case 'lineItem':
          await client.modifyLineItemStatus(
            advertiserId,
            task.parameters['lineItemId'] as string,
            targetStatus
          );
          return { status: 'success' };
        case 'insertionOrder':
          await client.modifyInsertionOrderStatus(
            advertiserId,
            task.parameters['insertionOrderId'] as string,
            targetStatus
          );
          return { status: 'success' };
        case 'campaign':
          await client.modifyCampaignStatus(
            advertiserId,
            task.parameters['campaignId'] as string,
            targetStatus
          );
          return { status: 'success' };
        default:
          return {
            status: 'failed',
            error: `Unsupported target entity type: ${entityType}`,
          };
      }
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }

  /**
   * @inheritdoc
   */
  async executeTasks(tasks: TargetAgentTask[]): Promise<OperationResult[]> {
    const results: OperationResult[] = [];
    for (const task of tasks) {
      const result = await this.executeTask(task);
      results.push(result);
    }
    return results;
  }

  /**
   * @inheritdoc
   */
  describe() {
    const description: TargetAgentMetadata = {
      id: 'dv360',
      name: 'Display & Video 360',
      type: 'target',
      targetEntities: [
        {
          name: 'Line Item',
          key: 'lineItem',
          parameters: ['advertiserId', 'lineItemId'],
        },
        {
          name: 'Insertion Order',
          key: 'insertionOrder',
          parameters: ['advertiserId', 'insertionOrderId'],
        },
        {
          name: 'Campaign',
          key: 'campaign',
          parameters: ['advertiserId', 'campaignId'],
        },
      ],
    };
    return Promise.resolve(description);
  }

  /**
   * Fetches a list of DV360 partners.
   * @param {Dv360ApiClient} client the DV360 API client
   * @returns {Promise<TargetEntityResponse>} the agent response
   */
  private async listPartners(
    client: Dv360ApiClient
  ): Promise<TargetEntityResponse> {
    try {
      const entities = await client.listPartners();
      return { status: 'success', entities };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }

  /**
   * Fetches a list of advertisers.
   * @param {Dv360ApiClient} client the DV360 API client
   * @param {Record<string, unknown>} parameters the parameters for the API call
   * @returns {Promise<TargetEntityResponse>} the agent response
   */
  private async listAdvertisers(
    client: Dv360ApiClient,
    parameters: Record<string, unknown>
  ): Promise<TargetEntityResponse> {
    if (!parameters['partnerId']) {
      return {
        status: 'failed',
        error: 'Missing required parameter: partnerId.',
      };
    }
    try {
      const entities = await client.listAdvertisers(
        parameters['partnerId'] as string
      );
      return { status: 'success', entities };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }
  /**
   * Fetches a list of campaigns.
   * @param {Dv360ApiClient} client the DV360 API client
   * @param {Record<string, unknown>} parameters the parameters for the API call
   * @returns {Promise<TargetEntityResponse>} the agent response
   */
  private async listCampaigns(
    client: Dv360ApiClient,
    parameters: Record<string, unknown>
  ): Promise<TargetEntityResponse> {
    if (!parameters['advertiserId']) {
      return {
        status: 'failed',
        error: 'Missing required parameter: advertiserId.',
      };
    }
    try {
      const entities = await client.listCampaigns(
        parameters['advertiserId'] as string
      );
      return { status: 'success', entities };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }
  /**
   * Fetches a list of insertion orders.
   * @param {Dv360ApiClient} client the DV360 API client
   * @param {Record<string, unknown>} parameters the parameters for the API call
   * @returns {Promise<TargetEntityResponse>} the agent response
   */
  private async listInsertionOrders(
    client: Dv360ApiClient,
    parameters: Record<string, unknown>
  ): Promise<TargetEntityResponse> {
    if (!parameters['advertiserId']) {
      return {
        status: 'failed',
        error: 'Missing required parameter: advertiserId.',
      };
    }
    try {
      const entities = await client.listInsertionOrders(
        parameters['advertiserId'] as string,
        parameters['campaignId'] as string | undefined
      );
      return { status: 'success', entities };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }
  /**
   * Fetches a list of insertion orders.
   * @param {Dv360ApiClient} client the DV360 API client
   * @param {Record<string, unknown>} parameters the parameters for the API call
   * @returns {Promise<TargetEntityResponse>} the agent response
   */
  private async listLineItems(
    client: Dv360ApiClient,
    parameters: Record<string, unknown>
  ): Promise<TargetEntityResponse> {
    if (!parameters['advertiserId']) {
      return {
        status: 'failed',
        error: 'Missing required parameter: advertiserId.',
      };
    }
    try {
      const entities = await client.listLineItems(
        parameters['advertiserId'] as string,
        parameters['campaignId'] as string | undefined,
        parameters['insertionOrderId'] as string | undefined
      );
      return { status: 'success', entities };
    } catch (err) {
      return {
        status: 'failed',
        error: err instanceof Error ? err.message : JSON.stringify(err),
      };
    }
  }

  /**
   * @inheritdoc
   */
  async listTargetEntities(
    type: string,
    parameters: Record<string, unknown>,
    requestor: User
  ): Promise<TargetEntityResponse> {
    const client = this.getDv360ApiClient(requestor);
    switch (type) {
      case 'partner':
        return this.listPartners(client);
      case 'advertiser':
        return this.listAdvertisers(client, parameters);
      case 'campaign':
        return this.listCampaigns(client, parameters);
      case 'insertionOrder':
        return this.listInsertionOrders(client, parameters);
      case 'lineItem':
        return this.listLineItems(client, parameters);
      default:
        return Promise.resolve({
          status: 'failed',
          error: `Unsupported target entity type: ${type}`,
        });
    }
  }
}
