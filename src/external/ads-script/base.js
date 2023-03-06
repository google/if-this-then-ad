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

class TargetAgent extends ApiHelper {
  name = '';
  requiredParameters = [];
  static instance;

  constructor() {
    super();
  }

  process(params, evaluation) {}

  validate(params, evaluation) {}

  /**
   * Find missing required parameters exist in object.
   *
   * @param {!Object} params
   * @returns {string}
   */
  findMissingRequiredParameter(params) {
    const keys = Object.keys(params);

    return this.requiredParameters.find((param) => !keys.includes(param));
  }

  /**
   * Ensure all required parameters exist in object.
   *
   * @param {!Object} params
   * @throws {Error}
   */
  ensureRequiredParameters(params) {
    // Check for missing parameters
    const missingParameter = !this.findMissingRequiredParameter(params);

    if (missingParameter) {
      throw new Error(`Missing parameter: '${missingParameter}'`);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }
}
