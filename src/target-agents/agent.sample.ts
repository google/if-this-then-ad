/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TargetAgent } from './base';

interface Parameters {
  token: string; // required
  advertiserId?: string; // optional
}

export class Sample extends TargetAgent {
  static friendlyName = 'Sample';
  requiredParameters: Array<keyof Parameters> = ['token'];

  /**
   * Process entity based on evaluation.
   *
   * @param {string} identifier
   * @param {string} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   */
  process(
    identifier: string,
    type: string,
    evaluation: boolean,
    params: Parameters
  ) {
    // Check for missing parameters
    this.ensureRequiredParameters(params);
  }

  /**
   * Check if supposed entity status matches its actual live status.
   *
   * @param {string} identifier
   * @param {string} type
   * @param {boolean} evaluation
   * @param {Parameters} params Additional parameters
   * @throws {Error}
   */
  validate(
    identifier: string,
    type: string,
    evaluation: boolean,
    params: Parameters
  ) {}
}
