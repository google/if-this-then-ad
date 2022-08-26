import { Comparator } from '../common/rule';
import { logger } from '../util/logger';

const COMPARATORS = new Map<string, (a: unknown, b: unknown) => boolean>([
  ['number_eq', (a, b) => a === b],
  ['number_gt', (a, b) => (a as number) > (b as number)],
  ['number_lt', (a, b) => (a as number) < (b as number)],
  ['string_eq', (a, b) => a === b],
  ['boolean_eq', (a, b) => a === b],
]);

/**
 * A service for evaluating rule conditions.
 */
export class ConditionsService {
  /**
   * Evaluates a comparison between two arbitrary values.
   * @param {unknown} value the first comparison operand
   * @param {Comparator} comparator the comparator
   * @param {unknown} other the second comparison operand
   * @returns {boolean|undefined} the result of the comparison or undefined if
   *   the comparison operation cannot be performed
   */
  evaluate(value: unknown, comparator: Comparator, other: unknown) {
    const valueType = typeof value;
    const otherType = typeof other;
    if (valueType !== otherType) {
      logger.error(
        `Condition: Trying to compare values of different type: ${valueType} <> ${otherType}`
      );
      return undefined;
    }

    const compare = COMPARATORS.get(`${valueType}_${comparator}`);
    if (!compare) {
      logger.error(
        `Condition: Cannot compare values of type ${valueType} with comparator ${comparator}`
      );
      return undefined;
    } else {
      return compare(value, other);
    }
  }
}

/**
 * The default singleton conditions service.
 */
export const conditionsService = new ConditionsService();
