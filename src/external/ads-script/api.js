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

export class ApiHelper {
  cache = {};

  /**
   * Constructor.
   */
  constructor() {
    this.cache = {};
  }

  /**
   * Call API.
   *
   * @param {string} url
   * @param {string} method
   * @param {?GoogleAppsScript.URL_Fetch.HttpHeaders} headers
   * @param {?Record<string, string>} queryParams
   * @param {?Object} body
   * @returns {Object}
   */
  callApi(
    url,
    headers,
    queryParams,
    body,
    method = 'get',
    contentType = 'application/json'
  ) {
    if (queryParams) {
      url = `${url}${this.objectToUrlQuery(url, queryParams)}`;
    }

    const params = {
      headers: headers ?? {},
      method: method,
      muteHttpExceptions: true,
      contentType: contentType,
    };

    // Add body if any
    if (body) {
      // Stringify JSON if applicable
      if (contentType === 'application/json') {
        body = JSON.stringify(body);
      }

      params.payload = body;
    }

    const cacheKey = `${url}-${JSON.stringify(params)}`;
    if (!(cacheKey in this.cache) || !this.cache[cacheKey]) {
      const res = UrlFetchApp.fetch(url, params);

      if (200 != res.getResponseCode() && 204 != res.getResponseCode()) {
        Logger.log('HTTP code: ' + res.getResponseCode());
        Logger.log('API error: ' + res.getContentText());
        Logger.log('URL: ' + url);
        throw new Error(res.getContentText());
      }

      this.cache[cacheKey] = res.getContentText()
        ? JSON.parse(res.getContentText())
        : {};
    }

    return this.cache[cacheKey];
  }

  /**
   * Convert object into URL query string.
   *
   * @param {string} url
   * @param {Object|null} obj
   * @returns {string}
   */
  objectToUrlQuery(url, obj) {
    if (!obj || (obj && Object.keys(obj).length === 0)) return '';

    const prefix = url.includes('?') ? '&' : '?';

    return prefix.concat(
      Object.keys(obj)
        .map((key) => {
          if (obj[key] instanceof Array) {
            const joined = obj[key].join(`&${key}=`);
            return joined.length ? `${key}=${joined}` : null;
          }
          return `${key}=${obj[key]}`;
        })
        .filter((param) => param)
        .join('&')
    );
  }
}
