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

import GoogleAdsClient from './googleads-client';
import {
  ActionResult,
  AdGroup,
  AgentMetadata,
  AgentTask,
  AgentType,
  EntityActions,
  EntityStatus,
  HttpMethods,
  IAgent,
  InstanceOptions,
} from './interfaces';
import { config } from './config';
import { log } from '@iftta/util';
/**
 * Class GoogleAdsAgent
 *
 * Enables use of Google Ads entities as targets for rules.
 */
export default class GoogleAdsAgent implements IAgent {
  public agentId = config.id;
  public name = config.name;

  /**
   * Describes agent capabilities and return types.
   * @returns {Promise<AgentMetadata>} - Agent Metadata
   */
  public async getAgentMetadata(): Promise<AgentMetadata> {
    const metadata: AgentMetadata = {
      id: config.id,
      name: config.name,
      type: AgentType.TARGET,
      arguments: ['campaignId', 'adGroupId'],
      params: [
        {
          name: 'Google Ads Developer Token',
          settingName: 'GOOGLEADS_DEV_TOKEN',
        },
        {
          name: 'Google Ads Manager Account ID',
          settingName: 'GOOGLEADS_MANAGER_ACCOUNT_ID',
        },
        {
          name: 'Google Ads Account ID',
          settingName: 'GOOGLEADS_ACCOUNT_ID',
        },
      ],
      api: [
        {
          dataPoint: 'adgroupId',
          list: {
            url: `/api/agents/${config.id}/list/adgroups`,
            method: HttpMethods.GET,
          },
        },
      ],
      dataPoints: [
        {
          id: 'campaignId',
          name: 'Campaign',
          dataType: typeof Number(),
        },
        {
          id: 'adGroupId',
          name: 'AdGroup',
          dataType: typeof Number(),
        },
        {
          id: 'adGroupStatus',
          name: 'Status',
          dataType: typeof String(),
        },
        {
          id: 'adGroupType',
          name: 'Type',
          dataType: typeof String(),
        },
      ],
    };
    return Promise.resolve(metadata);
  }
  /**
   * Gets user settings from the provided task
   * @param { AgentTask } task
   * @param { string } settingName
   * @returns { string } Setting value
   */
  private getRequiredUserSetting(task: AgentTask, settingName: string) {
    if (!task || !task.ownerSettings || !task.ownerSettings[settingName]) {
      throw new Error(`Owner setting ${settingName} must be defined`);
    }

    return task.ownerSettings[settingName];
  }

  /**
   * Execute all of a task's actions on Google Ads.
   *
   * @param {AgentTask} task - The task to execute
   * @returns {Array<ActionResult>} - Tesults of all the task's actions
   */
  public async execute(task: AgentTask): Promise<Array<ActionResult>> {
    const result: Array<ActionResult> = [];
    for (const action of task.target.actions) {
      log.debug(['ads.execute task', task]);

      const instanceOptions = {} as InstanceOptions;
      action.params.forEach((p) => {
        instanceOptions[p.key] = p.value;
      });

      try {
        const googleAds = new GoogleAdsClient(
          this.getRequiredUserSetting(task, 'GOOGLEADS_ACCOUNT_ID'),
          this.getRequiredUserSetting(task, 'GOOGLEADS_MANAGER_ACCOUNT_ID'),
          task.token.auth,
          this.getRequiredUserSetting(task, 'GOOGLEADS_DEV_TOKEN')
        );
        const shouldBeActive: boolean =
          action.type == EntityActions.ACTIVATE &&
          (task.target.result as boolean);
        await googleAds.updateAdGroup(
          instanceOptions.entityId!,
          shouldBeActive
        );
        const currentAdGroup: AdGroup = await googleAds.getAdGroupById(
          instanceOptions.entityId!
        );
        const updateResult = {
          ruleId: task.target.ruleId,
          agentId: config.id,
          displayName: currentAdGroup.name,
          entityStatus: shouldBeActive
            ? EntityStatus.ACTIVE
            : EntityStatus.PAUSED,
          timestamp: new Date(),
          success: true,
        };
        log.debug('ads.execute tmpResult', updateResult);
        result.push(updateResult);
      } catch (err) {
        log.debug('ads.agent Error:', err);
        result.push({
          ruleId: task.target.ruleId,
          agentId: config.id,
          timestamp: new Date(),
          success: false,
          error: err as string,
        });
      }
    }
    return result;
  }

  /**
   * Obtain a list of Google Ads Group entities.
   *
   * @param {string} oauthToken - OAuth token authorising this access
   * @param {string} developerToken - developer token to use
   * @param {string} managerAccountId - Manager account from which to operate
   * @param {string} customerAccountId - Ads account to operate on
   * @param {boolean} getOnlyActive - true if only enabled entities should be returned (false: all not removed)
   * @returns {Array<AdGroup>} - list of ad groups
   */
  public async listAdGroups(
    oauthToken: string,
    developerToken: string,
    managerAccountId: string,
    customerAccountId: string,
    getOnlyActive = false
  ): Promise<AdGroup[]> {
    const googleAds = new GoogleAdsClient(
      customerAccountId,
      managerAccountId,
      oauthToken,
      developerToken
    );

    return googleAds.listAdGroups(getOnlyActive);
  }
}
