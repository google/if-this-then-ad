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

      const switchLIStatusSpy = jest.spyOn(
        DV360.prototype as any,
        'switchLineItemStatus'
      );

      const switchEntityStatusSpy = jest.spyOn(
        DV360.prototype as any,
        'switchEntityStatus'
      );

      // Call function
      dv360.process('1234', DV360_ENTITY_TYPE.LINE_ITEM, true, params);

      // Evaluate
      expect(switchLIStatusSpy).toHaveBeenCalledWith('1', '1234', true);
      expect(switchEntityStatusSpy).toHaveBeenCalledWith(
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
        'https://displayvideo.googleapis.com/v1/advertisers/1/lineItems/1234'
      );
    });
  });
});
