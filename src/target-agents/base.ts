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

import { ApiHelper } from '../helpers/api';

export class TargetAgent extends ApiHelper {
  public static friendlyName: string = '';
  protected requiredParameters: string[] = [];
  static instance: TargetAgent;

  protected constructor() {
    super();
  }

  process(
    identifier: string,
    type: string,
    evaluation: boolean,
    params: Object
  ) {}

  validate(
    identifier: string,
    type: string,
    evaluation: boolean,
    params: Object
<<<<<<< HEAD
  ): string[] {
=======
  ): Array<string> {
>>>>>>> 0183214 (Improved validation log output)
    throw new Error('Method not implemented.');
  }

  /**
   * Find missing required parameters exist in object.
   *
   * @param {!Object} params
   * @returns {string}
   */
  private findMissingRequiredParameter(params: Object) {
    const keys = Object.keys(params);

    return this.requiredParameters.find((param) => !keys.includes(param));
  }

  /**
   * Ensure all required parameters exist in object.
   *
   * @param {!Object} params
   * @throws {Error}
   */
  protected ensureRequiredParameters(params: Object) {
    // Check for missing parameters
    const missingParameter = this.findMissingRequiredParameter(
      params as Object
    );

    if (missingParameter) {
      throw new Error(`Missing parameter: '${missingParameter}'`);
    }
  }

  /**
   * Get agent singleton instance.
   *
   * @returns {TargetAgent}
   */
  public static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}
