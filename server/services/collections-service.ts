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

import { Firestore } from '@google-cloud/firestore';
import { FirebaseCollection } from '../collections/firebase-collection';
import { UsersCollection } from '../collections/users-collection';
import { Rule } from '../common/rule';

/**
 * Provides access to model collections.
 */
export class CollectionService {
  readonly users = new UsersCollection(this.prefix + 'users', this.fireStore);
  readonly rules = new FirebaseCollection<Rule>(
    this.prefix + 'rules',
    this.fireStore
  );

  /**
   * Creates a collection service based on the environment variable configuration.
   * @returns {CollectionService} configured collection service.
   */
  static fromEnv() {
    const projectId = process.env.PROJECT_ID;
    if (!projectId) {
      throw new Error('Undefined env variable PROJECT_ID');
    }

    const envPrefix = process.env.DEMO_ENV_NAME;
    const prefix = envPrefix ? envPrefix.replace('/', '-') + ':' : '';

    const fireStore = new Firestore({ projectId });
    fireStore.settings({ ignoreUndefinedProperties: true });
    return new CollectionService(fireStore, prefix);
  }

  /**
   * Constructor.
   * @param {Firestore} fireStore the underlying Firestore database connection
   * @param {string} prefix a prefix for Firebase collections
   */
  constructor(
    private readonly fireStore: Firestore,
    private readonly prefix = ''
  ) {}
}

/**
 * The default singleton collections service.
 */
export const collectionService = CollectionService.fromEnv();
