import 'jest';
import { ConditionsService } from './conditions-service';

describe('ConditionsService', () => {
  let conditionsService: ConditionsService;
  beforeEach(() => {
    conditionsService = new ConditionsService();
  });

  describe('#evaluate', () => {
    it('evaluates {number eq number} ', () => {
      expect(conditionsService.evaluate(123, 'eq', 123)).toBe(true);
      expect(conditionsService.evaluate(123, 'eq', 124)).toBe(false);
    });
    it('evaluates {number gt number}', () => {
      expect(conditionsService.evaluate(123, 'gt', 122)).toBe(true);
      expect(conditionsService.evaluate(123, 'gt', 123)).toBe(false);
      expect(conditionsService.evaluate(123, 'gt', 124)).toBe(false);
    });
    it('evaluates {number lt number}', () => {
      expect(conditionsService.evaluate(122, 'lt', 123)).toBe(true);
      expect(conditionsService.evaluate(123, 'lt', 123)).toBe(false);
      expect(conditionsService.evaluate(124, 'lt', 123)).toBe(false);
    });
    it('evaluates {boolean eq boolean}', () => {
      expect(conditionsService.evaluate(true, 'eq', true)).toBe(true);
      expect(conditionsService.evaluate(false, 'eq', false)).toBe(true);
      expect(conditionsService.evaluate(true, 'eq', false)).toBe(false);
      expect(conditionsService.evaluate(false, 'eq', true)).toBe(false);
    });
    it('evaluates {string eq string}', () => {
      expect(conditionsService.evaluate('abc', 'eq', 'abc')).toBe(true);
      expect(conditionsService.evaluate('abc', 'eq', 'cde')).toBe(false);
    });

    it('does not evaluate for different data types', () => {
      expect(conditionsService.evaluate(1, 'eq', true)).toBe(undefined);
      expect(conditionsService.evaluate(true, 'eq', 1)).toBe(undefined);
      expect(conditionsService.evaluate(1, 'eq', '1')).toBe(undefined);
      expect(conditionsService.evaluate('1', 'eq', 1)).toBe(undefined);
      expect(conditionsService.evaluate('true', 'eq', true)).toBe(undefined);
      expect(conditionsService.evaluate(true, 'eq', 'true')).toBe(undefined);
    });

    it('does not evaluate {string gt string}', () => {
      expect(conditionsService.evaluate('123', 'gt', '122')).toBe(undefined);
    });
    it('does not evaluate {string lt string}', () => {
      expect(conditionsService.evaluate('123', 'lt', '122')).toBe(undefined);
    });
    it('does not evaluate {boolean gt boolean}', () => {
      expect(conditionsService.evaluate(true, 'gt', false)).toBe(undefined);
    });
    it('does not evaluate {boolean lt boolean}', () => {
      expect(conditionsService.evaluate(false, 'lt', true)).toBe(undefined);
    });
  });
});
