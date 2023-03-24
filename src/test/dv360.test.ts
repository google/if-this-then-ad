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
import { Auth } from '../helpers/auth';
import { DV360, DV360_ENTITY_TYPE } from '../target-agents/dv360';

describe('DV360 Target Agent', () => {
  const params = {
    advertiserId: '1',
  };

  describe('process', () => {
    beforeEach(() => {
      jest.spyOn(Auth.prototype, 'getAuthToken').mockReturnValue('');
    });

    it('Updates Line Item correctly', () => {
      const dv360 = new DV360();

      // Set up spies
      jest.spyOn(DV360.prototype as any, 'fetchUrl').mockReturnValue(null);

      const setLineItemStatusSpy = jest.spyOn(
        DV360.prototype as any,
        'setLineItemStatus'
      );

      const setEntityStatusSpy = jest.spyOn(
        DV360.prototype as any,
        'setEntityStatus'
      );

      // Call function
      dv360.process('1234', DV360_ENTITY_TYPE.LINE_ITEM, true, params);

      // Evaluate
      expect(setLineItemStatusSpy).toHaveBeenCalledWith('1', '1234', true);
      expect(setEntityStatusSpy).toHaveBeenCalledWith(
        '1',
        '1234',
        true,
        'lineItems'
      );
    });
  });

  describe('validate', () => {
    it('Validates Line Items status match correctly', () => {
      const dv360 = new DV360();

      const lineItem = {
        entityStatus: 'ENTITY_STATUS_ACTIVE',
      };

      // Set up spies
      jest.spyOn(DV360.prototype as any, 'fetchUrl').mockReturnValue(lineItem);
      const isLIActiveSpy = jest.spyOn(
        DV360.prototype as any,
        'isLineItemActive'
      );
      const getEntitySpy = jest.spyOn(DV360.prototype as any, 'getEntity');
      const fetchUrlSpy = jest.spyOn(DV360.prototype as any, 'fetchUrl');

      // Call function
      dv360.validate('1234', DV360_ENTITY_TYPE.LINE_ITEM, true, params);

      // Evaluate
      expect(isLIActiveSpy).toHaveBeenCalledWith('1', '1234');
      expect(getEntitySpy).toHaveBeenCalledWith('1', '1234', 'lineItems');
      expect(fetchUrlSpy).toHaveBeenCalledWith(
        'https://displayvideo.googleapis.com/v2/advertisers/1/lineItems/1234'
      );
    });
  });
});
