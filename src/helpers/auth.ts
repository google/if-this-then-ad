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

export interface ServiceAccount {
  type: 'this.serviceAccount';
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: 'https://accounts.google.com/o/oauth2/auth';
  token_uri: 'https://oauth2.googleapis.com/token';
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs';
  client_x509_cert_url: string;
  user_email: string;
}

/**
 * This is a wrapper class for handling authentification to DV360 API.
 * This class can be used to auth also to other Google APIs.
 */
export class Auth {
  serviceAccount: ServiceAccount;
  /**
   * Set the OAuth configuration.
   * In order to authorise your DV360 API calls you can:
   * 1. Use the same Google account as you open the spreadsheet.
   *   If you chose this approach, you don't need to do pass account.
   * 2. Use a service account.
   * This is a service account in JSON format from your GCP project.
   * How to get a service account credentials from GCP:
   * https://cloud.google.com/iam/docs/service-accounts
   *
   * Service account credentials should be specified in the following JSON format:
   * {
   * "type": "this.serviceAccount",
   * "project_id": "...",
   * "private_key_id": "...",
   * "private_key": "...",
   * "client_email": "...@...gserviceaccount.com",
   * "client_id": "...",
   * "auth_uri": "https://accounts.google.com/o/oauth2/auth",
   * "token_uri": "https://oauth2.googleapis.com/token",
   * "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
   * "client_x509_cert_url": "..."
   * }
   *
   * @param {?Object} account The service account or empty
   */
  constructor(account?: Object) {
    this.serviceAccount = account as ServiceAccount;
  }

  /**
   * Get Auth Token for OAuth authorisation for your service account.
   * You need this token in order to authorise your DV360 API requests.
   * See more: https://github.com/gsuitedevs/apps-script-oauth2/blob/master/README.md
   * See more: https://developers.google.com/apps-script/reference/script/script-app#getOAuthToken()
   *
   * @returns {string} OAuth Token
   */
  getAuthToken() {
    if (!this.serviceAccount || !('private_key' in this.serviceAccount)) {
      return ScriptApp.getOAuthToken();
    }

    const service = OAuth2.createService('Service Account')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')
      .setPrivateKey(this.serviceAccount.private_key)
      .setIssuer(this.serviceAccount.client_email)
      .setSubject(this.serviceAccount.user_email)
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setParam('access_type', 'offline')
      .setScope('https://www.googleapis.com/auth/display-video');

    service.reset();
    return service.getAccessToken();
  }
}
