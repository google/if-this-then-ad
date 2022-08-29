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

import { GaxiosOptions } from 'gaxios';
import { OAuth2Client } from 'google-auth-library';
import { OperationResult } from '../../../common/common';
import {
  TargetAgent,
  TargetAgentAction,
  TargetAgentMetadata,
  TargetAgentTask,
  TargetEntity,
  TargetEntityResponse,
} from '../../../common/target';
import { User } from '../../../common/user';
import { googleAuthService } from '../../../services/google-auth-service';

interface GoogleAdsAdgroupInfo {
  customerAccountId: string;
  campaign: { id: string; name: string };
  adGroup: { id: string; name: string; type: string; status: string };
}
interface GoogleAdsQueryResult<T> {
  results: T[];
}

const GOOGLEADS_API_URL = 'https://googleads.googleapis.com/v10';
const GOOGLEADS_AGENT_ID = 'google-ads';

/**
 * Target agent implementation for Google Ads.
 */
export class GoogleAdsAgent implements TargetAgent {
  readonly id = GOOGLEADS_AGENT_ID;

  /**
   * Performs an action on the specified ad group.
   * @param {OAuth2Client} client the authorized API client
   * @param {TargetAgentAction} action the action to perform
   * @param {string} customerAccountId the customer account ID
   * @param {string} adGroupId the ad group ID
   * @param {string} developerToken the Google Ads developer token
   * @param {string} managerAccountId the MCC ID
   * @returns {Promise<OperationResult>} the result of the action
   */
  public async performAdGroupAction(
    client: OAuth2Client,
    action: TargetAgentAction,
    customerAccountId: string,
    adGroupId: string,
    developerToken: string,
    managerAccountId: string
  ): Promise<OperationResult> {
    const resourceUrl = `/customers/${customerAccountId}/adGroups/${adGroupId}`;
    const adGroupOperation = {
      updateMask: 'status',
      update: {
        resourceName: resourceUrl,
        status: action === 'ACTIVATE' ? 'ENABLED' : 'PAUSED',
      },
    };
    const mutateOperation = { operations: [adGroupOperation] };

    const request: GaxiosOptions = {
      method: 'POST',
      baseURL: GOOGLEADS_API_URL,
      url: `/customers/${customerAccountId}/adGroups:mutate`,
      headers: {
        'developer-token': developerToken,
        'login-customer-id': parseInt(managerAccountId),
      },
      body: mutateOperation,
    };
    const response = await client.request(request);
    if (response.status === 200) {
      return { status: 'success' };
    } else {
      return {
        status: 'failed',
        error: `Failed to activate target entity: ${resourceUrl}`,
      };
    }
  }

  /**
   * Executes a single target agent task.
   * @param {TargetAgentTask} task the task to execute
   * @returns {Promise<OperationResult>} the result of the performed action
   */
  private executeTask(task: TargetAgentTask): Promise<OperationResult> {
    const client = googleAuthService.getAuthorizedClientForUser(task.owner);

    const entityType = task.parameters['entityType'];
    const customerAccountId = task.parameters['customerAccountId'] as string;
    const managerAccountId = task.ownerSettings['GOOGLEADS_MANAGER_ACCOUNT_ID'];
    const developerToken = task.ownerSettings['GOOGLEADS_DEV_TOKEN'];

    switch (entityType) {
      case 'adGroup':
        try {
          const adGroupId = task.parameters['adGroupId'] as string;
          return this.performAdGroupAction(
            client,
            task.action,
            customerAccountId,
            adGroupId,
            developerToken,
            managerAccountId
          );
        } catch (err) {
          return Promise.resolve({
            status: 'failed',
            error: err instanceof Error ? err.message : JSON.stringify(err),
          });
        }
      default:
        return Promise.resolve({
          status: 'failed',
          error: `Unsupported entity type: ${entityType}`,
        });
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
      id: 'google-ads',
      name: 'Google Ads',
      type: 'target',
      settings: [
        {
          key: 'GOOGLEADS_MANAGER_ACCOUNT_ID',
          name: 'Google Ads Manager Account ID',
        },
        { key: 'GOOGLEADS_DEV_TOKEN', name: 'Google Ads Developer Token' },
      ],
      targetEntities: [
        {
          name: 'Ad Group',
          key: 'adGroup',
          parameters: ['customerAccountId', 'adGroupId'],
        },
      ],
    };
    return Promise.resolve(description);
  }

  /**
   * @inheritdoc
   */
  async listTargetEntities(
    type: string,
    parameters: Record<string, unknown>,
    requestor: User,
    requestorSettings: Record<string, string>
  ): Promise<TargetEntityResponse> {
    const client = googleAuthService.getAuthorizedClientForUser(requestor);
    const customerAccountId = parameters['customerAccountId'] as string;
    const developerToken = requestorSettings['GOOGLEADS_DEV_TOKEN'] as string;
    const managerAccountId = requestorSettings[
      'GOOGLEADS_MANAGER_ACCOUNT_ID'
    ] as string;

    if (type === 'adGroup') {
      const query = `SELECT ad_group.name,
          campaign.id,
          campaign.name,
          ad_group.id,
          ad_group.name,
          ad_group.status,
          ad_group.type
      FROM ad_group
      WHERE ad_group.status != 'REMOVED'`;

      const response = await client.request<
        GoogleAdsQueryResult<GoogleAdsAdgroupInfo>
      >({
        url: `${GOOGLEADS_API_URL}/customers/${customerAccountId}/googleAds:search`,
        data: { query },
        method: 'POST',
        headers: {
          'developer-token': developerToken,
          'login-customer-id': parseInt(managerAccountId),
        },
      });

      if (response.status !== 200 || response.data === undefined) {
        return {
          status: 'failed',
          error: `HTTP error: ${response.statusText}`,
        };
      }

      const entities = response.data.results.map(
        ({ adGroup }) =>
          ({
            type: 'adGroup',
            parameters: { customerAccountId, adGroupId: adGroup.id },
            name: adGroup.name,
          } as TargetEntity)
      );

      return { status: 'success', entities };
    }
    return { status: 'failed', error: `Unsupported entity type: ${type}` };
  }
}
