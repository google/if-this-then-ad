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

import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { User } from './../models/user';

const usersCollection = Collections.get(Collection.USERS);
const userRepository = new Repository<User>(usersCollection);

/**
 * Task Configuration.
 */
class TaskConfiguration {
  private tokenUrl = '';
  private repo: Repository<User>;

  /**
   * Constructor.
   *
   * @param {Repository<User>} repository
   */
  constructor(repository: Repository<User>) {
    this.repo = repository;
  }

  /**
   * Get settings (i.e. API keys) for use with the agent.
   *
   * @param {string} userId
   * @param {string} agentId
   */
  public async getUserSettings(
    userId: string
  ): Promise<Record<string, string>> {
    try {
      const user: User = (await this.repo.get(userId)) as User;
      return user?.settings as Record<string, string>;
    } catch (err) {
      return Promise.reject(err);
    }
  }
}

export default new TaskConfiguration(userRepository);
