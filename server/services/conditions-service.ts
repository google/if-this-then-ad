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
