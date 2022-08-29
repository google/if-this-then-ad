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
import 'jest';
import { TargetAgentTask } from '../../../common/target';
import { User } from '../../../common/user';
import { GoogleAdsAgent } from './google-ads-agent';

jest.mock('google-auth-library');

const MOCK_OWNER: User = {
  id: '1',
  email: 'test@test.tst',
  profileId: '123',
  settings: {},
  credentials: {
    accessToken: 'test',
    expiry: new Date(),
    refreshToken: 'test',
  },
};
const MOCK_ACTIVATE_ADGROUP_TASK: TargetAgentTask = {
  action: 'ACTIVATE',
  agentId: 'google-ads',
  owner: MOCK_OWNER,
  ownerSettings: {
    GOOGLE_ADS_DEVELOPER_TOKEN: 'test',
    GOOGLE_ADS_MANAGER_ACCOUNT_ID: 'test',
  },
  parameters: {
    entityType: 'adGroup',
    customerAccountId: '1',
    adGroupId: '1',
  },
};
const MOCK_DEACTIVATE_ADGROUP_TASK: TargetAgentTask = {
  action: 'DEACTIVATE',
  agentId: 'google-ads',
  owner: MOCK_OWNER,
  ownerSettings: {
    GOOGLE_ADS_DEVELOPER_TOKEN: 'test',
    GOOGLE_ADS_MANAGER_ACCOUNT_ID: 'test',
  },
  parameters: {
    entityType: 'adGroup',
    customerAccountId: '1',
    adGroupId: '1',
  },
};

describe('GoogleAdsAgent', () => {
  let agent: GoogleAdsAgent;
  beforeEach(() => {
    jest.resetAllMocks();
    agent = new GoogleAdsAgent();
  });

  describe('#id', () => {
    it('exposes the correct ID', () => {
      expect(agent.id).toBe('google-ads');
    });
  });

  describe('#describe', () => {
    it('provides a description of the agent', async () => {
      const description = await agent.describe();
      expect(description.id).toBe('google-ads');
      expect(description.name).toBe('Google Ads');
      expect(description.targetEntities).toContainEqual({
        name: 'Ad Group',
        key: 'adGroup',
        parameters: ['customerAccountId', 'adGroupId'],
      });
      expect(description.settings).toContainEqual({
        key: 'GOOGLEADS_MANAGER_ACCOUNT_ID',
        name: 'Google Ads Manager Account ID',
      });
      expect(description.settings).toContainEqual({
        key: 'GOOGLEADS_DEV_TOKEN',
        name: 'Google Ads Developer Token',
      });
    });
  });

  describe('#executeTasks', () => {
    it('executes a simple task', async () => {
      const modifyAdGroupStatusSpy = jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementation(() =>
          Promise.resolve({
            status: 200,
          })
        );

      const results = await agent.executeTasks([MOCK_ACTIVATE_ADGROUP_TASK]);
      expect(results[0].status).toBe('success');
      expect(modifyAdGroupStatusSpy).toHaveBeenCalled();
    });

    it('executes a multiple tasks', async () => {
      const modifyAdGroupStatusSpy = jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementation(() => Promise.resolve({ status: 200 }));

      const results = await agent.executeTasks([
        MOCK_ACTIVATE_ADGROUP_TASK,
        MOCK_DEACTIVATE_ADGROUP_TASK,
      ]);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('success');
      expect(modifyAdGroupStatusSpy).toHaveBeenCalledTimes(2);
    });

    it('fails individual tasks if the client responds with an error', async () => {
      jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementationOnce(() => Promise.resolve({ status: 400 }))
        .mockImplementationOnce(() => Promise.resolve({ status: 200 }));

      const tasks: TargetAgentTask[] = [
        MOCK_ACTIVATE_ADGROUP_TASK,
        MOCK_DEACTIVATE_ADGROUP_TASK,
      ];

      const results = await agent.executeTasks(tasks);

      expect(results[0].status).toBe('failed');
      expect(results[1].status).toBe('success');
    });

    it('fails individual tasks for unsupported entity types', async () => {
      jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementationOnce(() => Promise.resolve({ status: 200 }));

      const tasks: TargetAgentTask[] = [
        MOCK_ACTIVATE_ADGROUP_TASK,
        {
          action: 'ACTIVATE',
          agentId: 'google-ads',
          owner: MOCK_OWNER,
          ownerSettings: {
            GOOGLE_ADS_DEVELOPER_TOKEN: 'test',
            GOOGLE_ADS_MANAGER_ACCOUNT_ID: 'test',
          },
          parameters: { type: 'unknown' },
        },
      ];

      const results = await agent.executeTasks(tasks);

      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('failed');
    });
  });

  describe('#listTargetEntities', () => {
    it('lists adgroups', async () => {
      const mockResponse = {
        status: 200,
        data: {
          results: [
            {
              customerAccountId: '1',
              campaign: { id: '1', name: 'campaign1' },
              adGroup: {
                id: '1',
                name: 'adGroup1',
                type: 'type',
                status: 'PAUSED',
              },
            },
          ],
        },
      };
      jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementation(() => Promise.resolve(mockResponse));

      const result = await agent.listTargetEntities(
        'adGroup',
        { customerAccountId: '1' },
        MOCK_OWNER,
        {
          GOOGLE_ADS_DEVELOPER_TOKEN: 'test',
          GOOGLE_ADS_MANAGER_ACCOUNT_ID: 'test',
        }
      );

      expect(result.status).toBe('success');
      expect(result.entities).toContainEqual({
        type: 'adGroup',
        name: 'adGroup1',
        parameters: {
          customerAccountId: '1',
          adGroupId: '1',
        },
      });
    });

    it('fails for unsupported line items', async () => {
      const result = await agent.listTargetEntities(
        'unknown',
        {},
        MOCK_OWNER,
        {}
      );
      expect(result.status).toBe('failed');
    });
    it('fails for api error responses', async () => {
      jest
        .spyOn(OAuth2Client.prototype, 'request')
        .mockImplementation(() => Promise.resolve({ status: 400 }));

      const result = await agent.listTargetEntities(
        'adGroup',
        { customerAccountId: '1' },
        MOCK_OWNER,
        {
          GOOGLE_ADS_DEVELOPER_TOKEN: 'test',
          GOOGLE_ADS_MANAGER_ACCOUNT_ID: 'test',
        }
      );
      expect(result.status).toBe('failed');
    });
  });
});
