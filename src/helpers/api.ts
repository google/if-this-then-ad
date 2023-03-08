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
  private cache: Record<string, Object> = {};

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

    if (200 != resRaw.getResponseCode() && 204 != resRaw.getResponseCode()) {
      Logger.log('HTTP code: ' + resRaw.getResponseCode());
      Logger.log('API error: ' + resRaw.getContentText());
      Logger.log('URL: ' + url);
<<<<<<< HEAD
<<<<<<< HEAD
      Logger.log('Parameters: ' + JSON.stringify(params));
=======
>>>>>>> 1a33360 (Built IFTTA v2)
=======
      Logger.log('Parameters: ' + JSON.stringify(params));
>>>>>>> aa0c034 (Addressing PR comments)
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

    /*if (!(cacheKey in this.cache) || !this.cache[cacheKey]) {
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

    return this.cache[cacheKey];*/
  }

  /**
   * Convert object into URL query string.
   *
   * @param {string} url
   * @param {Object|null} obj
   * @returns {string}
   */
  objectToUrlQuery(url: string, obj?: object) {
    if (!obj || (obj && Object.keys(obj).length === 0)) return '';

    const prefix = url.includes('?') ? '&' : '?';

    return prefix.concat(
      Object.keys(obj)
        .map((key) => {
          if ((obj as any)[key] instanceof Array) {
            const joined = (obj as any)[key].join(`&${key}=`);
            return joined.length ? `${key}=${joined}` : null;
          }
          return `${key}=${(obj as any)[key]}`;
        })
        .filter((param) => param)
        .join('&')
    );
  }
}
