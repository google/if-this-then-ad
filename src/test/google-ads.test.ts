/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ApiHelper } from '../helpers/api';
import { Auth } from '../helpers/auth';
import {
  GoogleAds,
  GOOGLE_ADS_ENTITY_STATUS,
  GOOGLE_ADS_SELECTOR_TYPE,
} from '../target-agents/google-ads';

describe('Google Ads Target Agent', () => {
  const params = {
    customerId: '1',
    developerToken: 'token',
  };

  const singleAdByIdRaw = {
    results: [
      {
        adGroupAd: {
          resourceName: 'customers/1/adGroupAds/1111~1234',
          status: 'ENABLED',
          ad: {
            resourceName: 'customers/1/ads/1234',
            id: '1234',
          },
        },
      },
    ],
    fieldMask: 'adGroupAd.ad.id,adGroupAd.status',
  };

  const singleAdById = {
    resourceName: 'customers/1/adGroupAds/1111~1234',
    status: 'ENABLED',
  };

  const multipleAdsByIdRaw = {
    results: [
      {
        adGroupAd: {
          resourceName: 'customers/1/adGroupAds/1111~1234',
          status: 'ENABLED',
          ad: {
            resourceName: 'customers/1/ads/1234',
            id: '1234',
          },
        },
      },
    ],
    fieldMask: 'adGroupAd.ad.id,adGroupAd.status',
  };

  describe('process', () => {
    beforeEach(() => {
      jest.spyOn(Auth.prototype, 'getAuthToken').mockReturnValue('');
    });

    it('Updates Ad correctly with single ID', () => {
      const ads = new GoogleAds();

      // Set up spies
      const fetchUrlSpy = jest.spyOn(GoogleAds.prototype as any, 'fetchUrl');

      jest
        .spyOn(GoogleAds.prototype as any, 'fetchUrl')
        .mockReturnValue(singleAdByIdRaw);

      const updateAdStatusByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'updateAdStatusById'
      );

      const updateEntityStatusSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'updateEntityStatus'
      );

      const getAdsByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'getAdsById'
      );

      // Call function
      ads.process('1234', GOOGLE_ADS_SELECTOR_TYPE.AD_ID, true, params);

      // Evaluate
      expect(updateAdStatusByIdSpy).toHaveBeenCalledWith(
        '1',
        ['1234'],
        GOOGLE_ADS_ENTITY_STATUS.ENABLED
      );

      expect(getAdsByIdSpy).toHaveBeenCalledWith('1', ['1234']);

      expect(updateEntityStatusSpy).toHaveBeenCalledWith(
        'customers/1/adGroupAds:mutate',
        singleAdById,
        GOOGLE_ADS_ENTITY_STATUS.ENABLED
      );

      expect(fetchUrlSpy).toHaveBeenCalledTimes(2);
    });

    it('Updates Ads correctly with multiple IDs', () => {
      const ads = new GoogleAds();

      // Set up spies
      const fetchUrlSpy = jest.spyOn(GoogleAds.prototype as any, 'fetchUrl');

      jest
        .spyOn(GoogleAds.prototype as any, 'fetchUrl')
        .mockReturnValue(singleAdByIdRaw);

      const updateAdStatusByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'updateAdStatusById'
      );

      const updateEntityStatusSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'updateEntityStatus'
      );

      const getAdsByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'getAdsById'
      );

      // Call function
      ads.process('1234;2345', GOOGLE_ADS_SELECTOR_TYPE.AD_ID, true, params);

      // Evaluate
      expect(updateAdStatusByIdSpy).toHaveBeenCalledWith(
        '1',
        ['1234', '2345'],
        GOOGLE_ADS_ENTITY_STATUS.ENABLED
      );

      expect(getAdsByIdSpy).toHaveBeenCalledWith('1', ['1234', '2345']);

      expect(updateEntityStatusSpy).toHaveBeenCalledWith(
        'customers/1/adGroupAds:mutate',
        singleAdById,
        GOOGLE_ADS_ENTITY_STATUS.ENABLED
      );

      expect(fetchUrlSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('validate', () => {
    it('Validates Ad status match correctly', () => {
      const ads = new GoogleAds();

      // Set up spies
      jest
        .spyOn(ApiHelper.prototype, 'callApi')
        .mockReturnValue(singleAdByIdRaw);

      jest.spyOn(Auth.prototype, 'getAuthToken').mockReturnValue('');

      const getAdsByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'getAdsById'
      );

      // Call function
      const res = ads.validate(
        '1234',
        GOOGLE_ADS_SELECTOR_TYPE.AD_ID,
        true,
        params
      );

      // Evaluate
      expect(getAdsByIdSpy).toHaveBeenCalled();
      expect(res).toEqual([]);
    });

    it('Validates Ad status mismatch correctly', () => {
      const ads = new GoogleAds();

      // Set up spies
      jest
        .spyOn(ApiHelper.prototype, 'callApi')
        .mockReturnValue(singleAdByIdRaw);
      jest.spyOn(Auth.prototype, 'getAuthToken').mockReturnValue('');

      const getAdsByIdSpy = jest.spyOn(
        GoogleAds.prototype as any,
        'getAdsById'
      );

      // Call function
      const res = ads.validate(
        '1234',
        GOOGLE_ADS_SELECTOR_TYPE.AD_ID,
        false,
        params
      );

      // Evaluate
      const expected = [
        `Status for 1234 (AD_ID) should be PAUSED but is ENABLED`,
      ];

      expect(getAdsByIdSpy).toHaveBeenCalled();
      expect(res).toEqual(expected);
    });
  });
});
