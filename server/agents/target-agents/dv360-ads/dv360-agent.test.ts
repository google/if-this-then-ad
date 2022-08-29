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

import 'jest';
import { TargetAgentTask } from '../../../common/target';
import { User } from '../../../common/user';
import { Dv360Agent } from './dv360-agent';
import { Dv360ApiClient } from './dv360-api-client';

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

const MOCK_ACTIVATE_CAMPAIGN_TASK: TargetAgentTask = {
  action: 'ACTIVATE',
  agentId: 'dv360',
  owner: MOCK_OWNER,
  ownerSettings: {},
  parameters: { advertiserId: '1', campaignId: '1', entityType: 'campaign' },
};
const MOCK_ACTIVATE_IO_TASK: TargetAgentTask = {
  action: 'ACTIVATE',
  agentId: 'dv360',
  owner: MOCK_OWNER,
  ownerSettings: {},
  parameters: {
    advertiserId: '1',
    insertionOrderId: '2',
    entityType: 'insertionOrder',
  },
};
const MOCK_DEACTIVATE_LI_TASK: TargetAgentTask = {
  action: 'DEACTIVATE',
  agentId: 'dv360',
  owner: MOCK_OWNER,
  ownerSettings: {},
  parameters: {
    advertiserId: '1',
    lineItemId: '3',
    entityType: 'lineItem',
  },
};

describe('Dv360Agent', () => {
  let agent: Dv360Agent;
  beforeEach(() => {
    jest.resetAllMocks();
    agent = new Dv360Agent();
  });

  describe('#id', () => {
    it('exposes the correct ID', () => {
      expect(agent.id).toBe('dv360');
    });
  });

  describe('#describe', () => {
    it('provides a description of the agent', async () => {
      const description = await agent.describe();
      expect(description.id).toBe('dv360');
      expect(description.name).toBe('Display & Video 360');
      expect(description.targetEntities).toContainEqual({
        name: 'Line Item',
        key: 'lineItem',
        parameters: ['advertiserId', 'lineItemId'],
      });
      expect(description.targetEntities).toContainEqual({
        name: 'Insertion Order',
        key: 'insertionOrder',
        parameters: ['advertiserId', 'insertionOrderId'],
      });
      expect(description.targetEntities).toContainEqual({
        name: 'Campaign',
        key: 'campaign',
        parameters: ['advertiserId', 'campaignId'],
      });
      expect(description.settings).toBeUndefined();
    });
  });

  describe('#executeTasks', () => {
    it('executes a simple task', async () => {
      const modifyCampaignStatusSpy = jest
        .spyOn(Dv360ApiClient.prototype, 'modifyCampaignStatus')
        .mockImplementation(() => Promise.resolve());

      const results = await agent.executeTasks([MOCK_ACTIVATE_CAMPAIGN_TASK]);
      expect(results[0].status).toBe('success');
      expect(modifyCampaignStatusSpy).toHaveBeenCalled();
    });

    it('executes a list of tasks', async () => {
      const modifyCampaignStatusSpy = jest
        .spyOn(Dv360ApiClient.prototype, 'modifyCampaignStatus')
        .mockImplementation(() => Promise.resolve());
      const modifyInsertionOrderStatusSpy = jest
        .spyOn(Dv360ApiClient.prototype, 'modifyInsertionOrderStatus')
        .mockImplementation(() => Promise.resolve());
      const modifyLineItemStatusSpy = jest
        .spyOn(Dv360ApiClient.prototype, 'modifyLineItemStatus')
        .mockImplementation(() => Promise.resolve());

      const tasks: TargetAgentTask[] = [
        MOCK_ACTIVATE_CAMPAIGN_TASK,
        MOCK_ACTIVATE_IO_TASK,
        MOCK_DEACTIVATE_LI_TASK,
      ];

      const results = await agent.executeTasks(tasks);
      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('success');
      expect(results[2].status).toBe('success');
      expect(modifyCampaignStatusSpy).toHaveBeenCalledWith(
        '1',
        '1',
        'ENTITY_STATUS_ACTIVE'
      );
      expect(modifyInsertionOrderStatusSpy).toHaveBeenCalledWith(
        '1',
        '2',
        'ENTITY_STATUS_ACTIVE'
      );
      expect(modifyLineItemStatusSpy).toHaveBeenCalledWith(
        '1',
        '3',
        'ENTITY_STATUS_PAUSED'
      );
    });

    it('fails individual tasks if the client throws an error', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'modifyCampaignStatus')
        .mockImplementationOnce(() => Promise.reject(new Error('err')))
        .mockImplementationOnce(() => Promise.resolve());

      const tasks: TargetAgentTask[] = [
        MOCK_ACTIVATE_CAMPAIGN_TASK,
        MOCK_ACTIVATE_CAMPAIGN_TASK,
      ];

      const results = await agent.executeTasks(tasks);

      expect(results[0].status).toBe('failed');
      expect(results[1].status).toBe('success');
    });

    it('fails individual tasks for unsupported entity types', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'modifyCampaignStatus')
        .mockImplementationOnce(() => Promise.resolve());

      const tasks: TargetAgentTask[] = [
        MOCK_ACTIVATE_CAMPAIGN_TASK,
        {
          action: 'ACTIVATE',
          agentId: 'dv360',
          owner: MOCK_OWNER,
          ownerSettings: {},
          parameters: { type: 'unknown' },
        },
      ];

      const results = await agent.executeTasks(tasks);

      expect(results[0].status).toBe('success');
      expect(results[1].status).toBe('failed');
    });
  });

  describe('#listEntities', () => {
    it('lists partners', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listPartners')
        .mockImplementationOnce(() =>
          Promise.resolve([
            {
              type: 'partner',
              name: 'partner1',
              parameters: { partnerId: '1' },
            },
          ])
        );

      const result = await agent.listTargetEntities('partner', {}, MOCK_OWNER);

      expect(result.status).toBe('success');
      expect(result.entities).toEqual([
        {
          type: 'partner',
          name: 'partner1',
          parameters: { partnerId: '1' },
        },
      ]);
    });
    it('fails to list partners in case of API errors', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listPartners')
        .mockImplementationOnce(() => Promise.reject(new Error('err')));

      const result = await agent.listTargetEntities('partner', {}, MOCK_OWNER);

      expect(result.status).toBe('failed');
    });

    it('lists advertisers for partner', async () => {
      const mockAdvertisers = [
        {
          type: 'advertiser',
          name: 'advertiser1',
          parameters: { partnerId: '1', advertiserId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listAdvertisers')
        .mockImplementationOnce(() => Promise.resolve(mockAdvertisers));

      const result = await agent.listTargetEntities(
        'advertiser',
        { partnerId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockAdvertisers);
    });
    it('fails to list advertisers in case of API errors', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listAdvertisers')
        .mockImplementationOnce(() => Promise.reject(new Error('err')));

      const result = await agent.listTargetEntities(
        'advertiser',
        { partnerId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });
    it('fails to list advertisers if no partner ID is provided', async () => {
      const result = await agent.listTargetEntities(
        'advertiser',
        {},
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });

    it('lists campaigns for advertiser', async () => {
      const mockCampaigns = [
        {
          type: 'campaign',
          name: 'campaign1',
          parameters: { advertiserId: '1', campaignId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listCampaigns')
        .mockImplementationOnce(() => Promise.resolve(mockCampaigns));

      const result = await agent.listTargetEntities(
        'campaign',
        { advertiserId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockCampaigns);
    });
    it('fails to list campaigns in case of API errors', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listCampaigns')
        .mockImplementationOnce(() => Promise.reject(new Error('err')));

      const result = await agent.listTargetEntities(
        'campaign',
        { advertiserId: 1 },
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });
    it('fails to list advertisers if no partner ID is provided', async () => {
      const result = await agent.listTargetEntities('campaign', {}, MOCK_OWNER);

      expect(result.status).toBe('failed');
    });

    it('lists insertion orders for advertiser', async () => {
      const mockIos = [
        {
          type: 'insertionOrder',
          name: 'io1',
          parameters: { advertiserId: '1', insertionOrderId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listInsertionOrders')
        .mockImplementationOnce(() => Promise.resolve(mockIos));

      const result = await agent.listTargetEntities(
        'insertionOrder',
        { advertiserId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockIos);
    });
    it('lists insertion orders for advertiser and campaign', async () => {
      const mockIos = [
        {
          type: 'insertionOrder',
          name: 'io1',
          parameters: { advertiserId: '1', insertionOrderId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listInsertionOrders')
        .mockImplementationOnce(() => Promise.resolve(mockIos));

      const result = await agent.listTargetEntities(
        'insertionOrder',
        { advertiserId: '1', campaignId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockIos);
    });
    it('fails to list insertion orders in case of API errors', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listInsertionOrders')
        .mockImplementationOnce(() => Promise.reject(new Error('err')));

      const result = await agent.listTargetEntities(
        'insertionOrder',
        { advertiserId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });
    it('fails to list insertion orders if no advertiser ID is provided', async () => {
      const result = await agent.listTargetEntities(
        'insertionOrder',
        {},
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });

    it('lists line items for advertiser', async () => {
      const mockLineItems = [
        {
          type: 'lineItem',
          name: 'li1',
          parameters: { advertiserId: '1', lineItemId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listLineItems')
        .mockImplementationOnce(() => Promise.resolve(mockLineItems));

      const result = await agent.listTargetEntities(
        'lineItem',
        { advertiserId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockLineItems);
    });
    it('lists line items for advertiser and campaign', async () => {
      const mockLineItems = [
        {
          type: 'lineItem',
          name: 'li1',
          parameters: { advertiserId: '1', lineItemId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listLineItems')
        .mockImplementationOnce(() => Promise.resolve(mockLineItems));

      const result = await agent.listTargetEntities(
        'lineItem',
        { advertiserId: '1', campaignId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockLineItems);
    });
    it('lists line items for advertiser and insertion order', async () => {
      const mockLineItems = [
        {
          type: 'lineItem',
          name: 'li1',
          parameters: { advertiserId: '1', lineItemId: '1' },
        },
      ];
      jest
        .spyOn(Dv360ApiClient.prototype, 'listLineItems')
        .mockImplementationOnce(() => Promise.resolve(mockLineItems));

      const result = await agent.listTargetEntities(
        'lineItem',
        { advertiserId: '1', insertionOrder: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('success');
      expect(result.entities).toEqual(mockLineItems);
    });
    it('fails to list line items in case of API errors', async () => {
      jest
        .spyOn(Dv360ApiClient.prototype, 'listLineItems')
        .mockImplementationOnce(() => Promise.reject(new Error('err')));

      const result = await agent.listTargetEntities(
        'lineItem',
        { advertiserId: '1' },
        MOCK_OWNER
      );

      expect(result.status).toBe('failed');
    });
    it('fails to list insertion orders if no advertiser ID is provided', async () => {
      const result = await agent.listTargetEntities('lineItem', {}, MOCK_OWNER);

      expect(result.status).toBe('failed');
    });

    it('fails for unsupported line items', async () => {
      const result = await agent.listTargetEntities('unknown', {}, MOCK_OWNER);

      expect(result.status).toBe('failed');
    });
  });
});
