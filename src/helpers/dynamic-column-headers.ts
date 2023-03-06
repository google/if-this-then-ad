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

import { JPath } from './jpath';

export class DynamicColumnHeaders {
  headers: Array<string>;
  static namespaceSeparator = ':';

  /**
   * Constructor.
   *
   * @param {Array<string>} headers
   */
  constructor(headers: Array<string>) {
    this.headers = headers;
  }

  /**
   * Maps values of cells in a row to their respective
   * header for a given namespace.
   * With no namespace provided, it returns values for ALL namespaces
   * and nests the results under each namespace as property.
   * Per default it will nest results under the respective group, which is '0'
   * if none exists.
   *
   * @param {Array<string>} row
   * @param {string} namespace
   * @param {string} separator
   * @param {boolean} includeGroup
   * @returns {Record<string, Object>}
   */
  getMappedValues(
    row: Array<string>,
    namespace: string | undefined = undefined,
    includeGroup: boolean = true
  ): Record<string, any> {
    let res = {};

    row.forEach((cell, index) => {
      const exp = new RegExp(
        `^${namespace ?? '\\w+'}(?:\\.\\d)*${
          DynamicColumnHeaders.namespaceSeparator
        }`
      );

      if (exp.test(this.headers[index])) {
        const prefixAndPath = this.headers[index].split(
          DynamicColumnHeaders.namespaceSeparator
        );
        const namespaceAndGroupArr = prefixAndPath[0].split('.');
        const group = namespaceAndGroupArr[1] ?? '0';

        // Only include namespace in path when extracting for ALL namespaces
        const path = `${namespace ? '' : `${namespaceAndGroupArr[0]}.`}${
          includeGroup ? `${group}.` : ''
        }${prefixAndPath[1]}`;

        res = JPath.setValue(res, path, cell);
      }
    });

    return res;
  }

  /**
   * Returns the index of the first header to have the given namespace.
   *
   * @param {string} namespace
   * @returns {number}
   */
  getFirstColWithNamespace(namespace: string) {
    const exp = new RegExp(
      `^${namespace ?? '\\w+'}(?:\\.\\d)*${
        DynamicColumnHeaders.namespaceSeparator
      }`
    );
    return this.headers.findIndex((header) => exp.test(header));
  }
}
