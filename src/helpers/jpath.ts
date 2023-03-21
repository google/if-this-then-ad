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

export class JPath {
  /**
   * Get Object entry value for the provided path.
   *
   * @param {string} path Format '<entity>.<entity>.<array index>.<entity>'
   * @param {Object} json JSON or JavaScript Object
   * @returns {string} Value from JSON or null if value does not exist
   */
  static getValue(path: string, json: Object) {
    let tmpJson: Record<string, any> = json;
    const val = null;

    for (const part of path.split('.')) {
      if (part.startsWith('!')) {
        return this.getAgregatedValue(part.substring(1), tmpJson);
      }

      let tmpVal;
      const intVal = parseInt(part);
      if (intVal && intVal in tmpJson) {
        tmpVal = tmpJson[intVal];
      } else if (Object.prototype.hasOwnProperty.call(tmpJson, part)) {
        tmpVal = tmpJson[part];
      } else {
        break;
      }

      const typeOf = typeof tmpVal;
      if ('string' === typeOf || 'number' === typeOf) {
        return tmpVal;
      } else {
        tmpJson = tmpVal;
      }
    }

    return val;
  }

  /**
   * Get aggregated value (e.g. MAX, MIN, etc.) from JSON entry values.
   *
   * @param {string} aggFunction Aggregation function (now only MIN and MAX function are supported)
   * @param {Object} json JSON or JavaScript Object
   * @returns {number} Agregated value from JSON
   */
  static getAgregatedValue(aggFunction: string, json: Object) {
    switch (aggFunction.toLowerCase()) {
      case 'min':
        return Math.min(...Object.values(json));

      case 'max':
        return Math.max(...Object.values(json));

      default:
        throw `Aggregation function "${aggFunction}" is not supported`;
    }
  }

  /**
   * Set Object property at specified path.
   *
   * @param {Record<string, any>} obj
   * @param {string} pathString
   * @param {string|number} value
   * @returns {Record<string, any>}
   */
  static setValue(
    obj: Record<string, any>,
    pathString: string,
    value: string | number
  ) {
    let curr = obj;
    const path = pathString.split('.');

    path.forEach((key, index) => {
      if (index + 1 === path.length) {
        curr[key] = value;
      } else {
        if (!(key in curr)) {
          curr[key] = {};
        }
        curr = curr[key];
      }
    });

    return obj;
  }
}
