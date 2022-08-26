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
import { TargetEntity } from '../../../common/target';
import { Dv360ApiClient } from './dv360-api-client';
jest.mock('google-auth-library');

const responseSuccess = (data?: object) => () =>
  Promise.resolve({ status: 200, statusText: 'ok', data });
const responseFailed = (code: number) => () =>
  Promise.resolve({ status: code, statusText: 'error' });

describe('Dv360ApiClient', () => {
  const oauthMock = jest.mocked(new OAuth2Client(), true);
  let client: Dv360ApiClient;
  beforeEach(() => {
    jest.resetAllMocks();
    client = new Dv360ApiClient(oauthMock);
  });

  describe('#listPartners', () => {
    it('lists partner entities across multiple API pages', async () => {
      const mockPartnerPage1 = {
        partners: [
          { partnerId: '1', displayName: 'partner1' },
          { partnerId: '2', displayName: 'partner2' },
        ],
        nextPageToken: 'test',
      };
      const mockPartnerPage2 = {
        partners: [{ partnerId: '3', displayName: 'partner3' }],
      };
      oauthMock.request
        .mockImplementationOnce(responseSuccess(mockPartnerPage1))
        .mockImplementationOnce(responseSuccess(mockPartnerPage2));

      const expectedEntities: TargetEntity[] = [
        {
          type: 'partner',
          name: 'partner1',
          parameters: { partnerId: '1' },
        },
        {
          type: 'partner',
          parameters: { partnerId: '2' },
          name: 'partner2',
        },
        {
          type: 'partner',
          parameters: { partnerId: '3' },
          name: 'partner3',
        },
      ];

      const partners = await client.listPartners();
      expect(partners).toContainEqual(
        expect.objectContaining(expectedEntities[0])
      );
      expect(partners).toContainEqual(
        expect.objectContaining(expectedEntities[1])
      );
      expect(partners).toContainEqual(
        expect.objectContaining(expectedEntities[2])
      );
    });

    it('fails if the API request fails', async () => {
      oauthMock.request.mockImplementationOnce(responseFailed(401));
      expect(client.listPartners()).rejects.toBeDefined();
    });
  });

  describe('#listAdvertisers', () => {
    it('lists all advertisers under a partner', async () => {
      const mockAdvertisers1 = {
        advertisers: [
          { partnerId: '1', advertiserId: '1', displayName: 'adv1' },
        ],
        nextPageToken: 'abc',
      };
      const mockAdvertisers2 = {
        advertisers: [
          { partnerId: '1', advertiserId: '2', displayName: 'adv2' },
        ],
      };
      oauthMock.request
        .mockImplementationOnce(responseSuccess(mockAdvertisers1))
        .mockImplementationOnce(responseSuccess(mockAdvertisers2));
      const expectedEntities = [
        {
          type: 'advertiser',
          parameters: { partnerId: '1', advertiserId: '1' },
          name: 'adv1',
        },
        {
          type: 'advertiser',
          parameters: { partnerId: '1', advertiserId: '2' },
          name: 'adv2',
        },
      ];

      const advertisers = await client.listAdvertisers('1');

      expect(advertisers).toContainEqual(
        expect.objectContaining(expectedEntities[0])
      );
      expect(advertisers).toContainEqual(
        expect.objectContaining(expectedEntities[1])
      );
    });

    it('fails if the API request fails', async () => {
      oauthMock.request.mockImplementationOnce(responseFailed(401));
      expect(client.listAdvertisers('123')).rejects.toBeDefined();
    });
  });

  describe('#listCampaigns', () => {
    it('lists all campaigns under an advertiser', async () => {
      const mockResponses = [
        {
          campaigns: [
            { advertiserId: '1', campaignId: '1', displayName: 'cmp1' },
          ],
          nextPageToken: 'abc',
        },
        {
          campaigns: [
            { advertiserId: '1', campaignId: '2', displayName: 'cmp2' },
          ],
        },
      ];
      oauthMock.request
        .mockImplementationOnce(responseSuccess(mockResponses[0]))
        .mockImplementationOnce(responseSuccess(mockResponses[1]));
      const expectedEntities = [
        {
          type: 'campaign',
          parameters: { campaignId: '1', advertiserId: '1' },
          name: 'cmp1',
        },
        {
          type: 'campaign',
          parameters: { campaignId: '2', advertiserId: '1' },
          name: 'cmp2',
        },
      ];

      const campaigns = await client.listCampaigns('1');

      expect(campaigns).toContainEqual(
        expect.objectContaining(expectedEntities[0])
      );
      expect(campaigns).toContainEqual(
        expect.objectContaining(expectedEntities[1])
      );
    });

    it('fails if the API request fails', async () => {
      oauthMock.request.mockImplementationOnce(responseFailed(401));
      expect(client.listCampaigns('123')).rejects.toBeDefined();
    });
  });

  describe('#listInsertionOrders', () => {
    it('lists all campaigns under an advertiser', async () => {
      const mockResponses = [
        {
          insertionOrders: [
            { advertiserId: '1', insertionOrderId: '1', displayName: 'io1' },
          ],
          nextPageToken: 'abc',
        },
        {
          insertionOrders: [
            { advertiserId: '1', insertionOrderId: '2', displayName: 'io2' },
          ],
        },
      ];
      oauthMock.request
        .mockImplementationOnce(responseSuccess(mockResponses[0]))
        .mockImplementationOnce(responseSuccess(mockResponses[1]));
      const expectedEntities = [
        {
          type: 'insertionOrder',
          parameters: { advertiserId: '1', insertionOrderId: '1' },
          name: 'io1',
        },
        {
          type: 'insertionOrder',
          parameters: { advertiserId: '1', insertionOrderId: '2' },
          name: 'io2',
        },
      ];

      const insertionOrders = await client.listInsertionOrders('1');

      expect(insertionOrders).toContainEqual(
        expect.objectContaining(expectedEntities[0])
      );
      expect(insertionOrders).toContainEqual(
        expect.objectContaining(expectedEntities[1])
      );
    });

    it('applies the optional campaign id filter', async () => {
      oauthMock.request.mockImplementationOnce(
        responseSuccess({
          insertionOrders: [
            { advertiserId: '1', insertionOrderId: '1', displayName: 'io1' },
          ],
        })
      );

      await client.listInsertionOrders('1', '2');
      expect(oauthMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            filter: expect.stringMatching('campaignId=2'),
          }),
        })
      );
    });

    it('fails if the API request fails', async () => {
      oauthMock.request.mockImplementationOnce(responseFailed(401));
      expect(client.listInsertionOrders('123')).rejects.toBeDefined();
    });
  });

  describe('#listLineItems', () => {
    it('lists all line items under an advertiser', async () => {
      const mockResponses = [
        {
          lineItems: [
            { advertiserId: '1', lineItemId: '1', displayName: 'li1' },
          ],
          nextPageToken: 'abc',
        },
        {
          lineItems: [
            { advertiserId: '1', lineItemId: '2', displayName: 'li2' },
          ],
        },
      ];
      oauthMock.request
        .mockImplementationOnce(responseSuccess(mockResponses[0]))
        .mockImplementationOnce(responseSuccess(mockResponses[1]));
      const expectedEntities = [
        {
          type: 'lineItem',
          parameters: { advertiserId: '1', lineItemId: '1' },
          name: 'li1',
        },
        {
          type: 'lineItem',
          parameters: { advertiserId: '1', lineItemId: '2' },
          name: 'li2',
        },
      ];

      const lineItems = await client.listLineItems('1');

      expect(lineItems).toContainEqual(
        expect.objectContaining(expectedEntities[0])
      );
      expect(lineItems).toContainEqual(
        expect.objectContaining(expectedEntities[1])
      );
    });

    it('applies the optional campaign id filter', async () => {
      oauthMock.request.mockImplementationOnce(
        responseSuccess({
          lineItems: [
            { advertiserId: '1', lineItemId: '1', displayName: 'li1' },
          ],
        })
      );

      await client.listLineItems('1', '2');
      expect(oauthMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            filter: expect.stringMatching('campaignId=2'),
          }),
        })
      );
    });

    it('applies the optional insertion order ID filter', async () => {
      oauthMock.request.mockImplementationOnce(
        responseSuccess({
          lineItems: [
            { advertiserId: '1', lineItemId: '1', displayName: 'li1' },
          ],
        })
      );

      await client.listLineItems('1', '2', '3');
      expect(oauthMock.request).toHaveBeenCalledWith(
        expect.objectContaining({
          params: expect.objectContaining({
            filter: expect.stringMatching('insertionOrderId=3'),
          }),
        })
      );
    });

    it('fails if the API request fails', async () => {
      oauthMock.request.mockImplementationOnce(responseFailed(401));
      expect(client.listCampaigns('123')).rejects.toBeDefined();
    });
  });

  describe('modifyCampaignStatus', () => {
    it('sets the target campaign status to active', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyCampaignStatus('1', '1', 'ENTITY_STATUS_ACTIVE');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/campaigns/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_ACTIVE' },
      });
    });
    it('sets the target campaign status to paused', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyCampaignStatus('1', '1', 'ENTITY_STATUS_PAUSED');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/campaigns/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_PAUSED' },
      });
    });
    it('failes if the API call fails', () => {
      oauthMock.request.mockImplementationOnce(responseFailed(400));
      expect(
        client.modifyCampaignStatus('1', '1', 'ENTITY_STATUS_ACTIVE')
      ).rejects.toBeDefined();
    });
  });

  describe('modifyInsertionOrderStatus', () => {
    it('sets the target campaign status to active', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyInsertionOrderStatus('1', '1', 'ENTITY_STATUS_ACTIVE');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/insertionOrders/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_ACTIVE' },
      });
    });
    it('sets the target campaign status to paused', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyInsertionOrderStatus('1', '1', 'ENTITY_STATUS_PAUSED');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/insertionOrders/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_PAUSED' },
      });
    });
    it('failes if the API call fails', () => {
      oauthMock.request.mockImplementationOnce(responseFailed(400));
      expect(
        client.modifyInsertionOrderStatus('1', '1', 'ENTITY_STATUS_ACTIVE')
      ).rejects.toBeDefined();
    });
  });
  describe('modifyLineItemStatus', () => {
    it('sets the target campaign status to active', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyLineItemStatus('1', '1', 'ENTITY_STATUS_ACTIVE');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/lineItems/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_ACTIVE' },
      });
    });
    it('sets the target campaign status to paused', async () => {
      oauthMock.request.mockImplementationOnce(responseSuccess());

      await client.modifyLineItemStatus('1', '1', 'ENTITY_STATUS_PAUSED');

      expect(oauthMock.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: 'https://displayvideo.googleapis.com/v1/advertisers/1/lineItems/1',
        params: { updateMask: 'entityStatus' },
        body: { entityStatus: 'ENTITY_STATUS_PAUSED' },
      });
    });
    it('failes if the API call fails', () => {
      oauthMock.request.mockImplementationOnce(responseFailed(400));
      expect(
        client.modifyLineItemStatus('1', '1', 'ENTITY_STATUS_ACTIVE')
      ).rejects.toBeDefined();
    });
  });
});
