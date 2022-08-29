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

import { User } from 'common/user';
import { FirebaseCollection } from './firebase-collection';

/**
 * A firebase collection implementation with additional functionality for users.
 */
export class UsersCollection extends FirebaseCollection<User> {
  /**
   *
   * @param {string} accessToken
   * @returns {Promise<User|undefined>} the user or undefined if no user with
   *    access token can be found.
   */
  async findByAccessToken(accessToken: string): Promise<User | undefined> {
    const [user] = await this.findWhere('credentials.accessToken', accessToken);
    return user;
  }
}
