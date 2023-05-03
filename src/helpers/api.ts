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

export class ApiHelper {
  private cache: Record<string, Object> = {};

  /**
   * Call API.
   *
   * @param {string} url
   * @param {?GoogleAppsScript.URL_Fetch.HttpHeaders} headers
   * @param {?Record<string, string>} queryParams
   * @param {?Object} body
   * @param {string} method
   * @param {string} contentType
   * @param {boolean} forceCache
   * @returns {Object}
   */
  callApi(
    url: string,
    headers?: GoogleAppsScript.URL_Fetch.HttpHeaders,
    queryParams?: Record<string, string>,
    body?: Object,
    method = 'get',
    contentType = 'application/json',
    forceCache = false
  ) {
    if (queryParams) {
      url = `${url}${this.objectToUrlQuery(url, queryParams)}`;
    }

    const params: {
      headers: GoogleAppsScript.URL_Fetch.HttpHeaders;
      method: GoogleAppsScript.URL_Fetch.HttpMethod;
      muteHttpExceptions: boolean;
      contentType?: string;
      payload?: Object;
    } = {
      headers: headers ?? {},
      method: method as GoogleAppsScript.URL_Fetch.HttpMethod,
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

    if (cacheKey in this.cache && this.cache[cacheKey]) {
      console.log(
        'Returning cached result',
        JSON.stringify(this.cache[cacheKey])
      );
      return this.cache[cacheKey];
    }

    const resRaw = UrlFetchApp.fetch(url, params);

    if (200 !== resRaw.getResponseCode() && 204 !== resRaw.getResponseCode()) {
      Logger.log('HTTP code: ' + resRaw.getResponseCode());
      Logger.log('API error: ' + resRaw.getContentText());
      Logger.log('URL: ' + url);
      Logger.log('Parameters: ' + JSON.stringify(params));
      throw new Error(resRaw.getContentText());
    }

    const res = resRaw.getContentText()
      ? JSON.parse(resRaw.getContentText())
      : {};

    // Only cache GET and forced cache requests
    if (method.toLowerCase() === 'get' || forceCache) {
      this.cache[cacheKey] = res;
    }

    return res;
  }

  /**
   * Convert object into URL query string.
   *
   * @param {string} url
   * @param {Record<string, unknown>} obj
   * @returns {string}
   */
  objectToUrlQuery(url: string, obj?: Record<string, unknown>) {
    if (!obj || (obj && Object.keys(obj).length === 0)) return '';

    const prefix = url.includes('?') ? '&' : '?';

    return prefix.concat(
      Object.keys(obj)
        .map(key => {
          if (obj[key] instanceof Array) {
            const joined = (obj[key] as Array<unknown>).join(`&${key}=`);
            return joined.length ? `${key}=${joined}` : null;
          }
          return `${key}=${obj[key]}`;
        })
        .filter(param => param)
        .join('&')
    );
  }
}
