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

import { log, isObject } from '@iftta/util';
import { FirestoreCollection } from '../models/fire-store-entity';
import { QueryDocumentSnapshot } from '@google-cloud/firestore';

/**
 * Repository Service.
 */
class RepositoryService<T> {
  db: any;
  fireStoreCollection: FirestoreCollection;

  /**
   * Constructor.
   *
   * @param {FirestoreCollection} collection
   */
  constructor(collection: FirestoreCollection) {
    if (collection == null) {
      throw new Error('Collection name must be specified');
    }
    this.fireStoreCollection = collection;
    this.db = collection.db;
  }

  /**
   * Convert date from JS to Firestore.
   *
   * @returns {any}
   */
  private dateConverter() {
    const fromFirestore = function (snapshot: QueryDocumentSnapshot) {
      const deepInspect = (data) => {
        for (const field of Object.keys(data)) {
          // detect the timestamp object
          if (isObject(data[field])) {
            if (Object.keys(data[field]).includes('_seconds')) {
              log.debug(`Converting field : ${field}  to Date`);
              // convert to JS Date so that we dont have to deal wtih Timestamp object
              data[field] = data[field].toDate();
            }
            // go down a level recursively.
            deepInspect(data[field]);
          }
        }
      };

      const data = snapshot.data();

      deepInspect(data);
      log.debug(data);
      return data;
    };

    return { fromFirestore: fromFirestore };
  }

  /**
   * Save.
   *
   * @param {T} obj
   * @returns {Promise<string>}
   */
  async save<T>(obj: T): Promise<string> {
    log.debug('Saving data to firestore');
    log.debug(JSON.stringify(obj, null, 2));
    try {
      const collectionRef = this.db.collection(this.fireStoreCollection.name);
      const result = await collectionRef.add(obj);
      log.debug('Saved entity with id :' + result.id);
      return result.id;
    } catch (err) {
      log.error(err);
    }
    return '';
  }

  /**
   * List.
   *
   * @returns {Promise<T[]>}
   */
  async list(): Promise<T[]> {
    const data: T[] = [];

    try {
      const collection = await this.db
        .collection(this.fireStoreCollection.name)
        .withConverter(this.dateConverter())
        .get();

      collection.forEach((entry) => {
        data.push({ id: entry.id, ...entry.data() });
      });
      log.debug('Repository:list');
      log.debug(data);
      return data;
    } catch (err) {
      log.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Get.
   *
   * @param {string} id
   * @returns {Promise<T | undefined>}
   */
  async get(id: string): Promise<T | undefined> {
    log.debug(['Repository:get', id]);
    if (!id) {
      throw new Error('Document id cannot be empty');
    }

    try {
      const docRef = this.db
        .collection(this.fireStoreCollection.name)
        .withConverter(this.dateConverter())
        .doc(id);

      const doc = await docRef.get();

      if (!doc.exists) {
        log.info(`Document with id : ${id} not found`);
      }
      const data = { id: doc.id, ...doc.data() };

      return data;
    } catch (err) {
      log.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Get by field name and value.
   *
   * @param {any} fieldName
   * @param {string | number | boolean} fieldValue
   * @returns {Promise<T[]>}
   */
  async getBy(
    fieldName: any,
    fieldValue: string | number | boolean
  ): Promise<T[]> {
    log.debug('Repository:getBy');
    const data: Array<T> = [];
    try {
      if (fieldValue == undefined) {
        throw new Error(
          `Searches by undefined field values are not supported. ${fieldName}:${fieldValue}`
        );
      }
      const colRef = this.db
        .collection(this.fireStoreCollection.name)
        .withConverter(this.dateConverter());
      const snapshot = await colRef.where(fieldName, '==', fieldValue).get();

      if (snapshot.empty) {
        log.debug(
          `Collection ${this.fireStoreCollection.name} contains no document with field ${fieldName} : ${fieldValue}`
        );
      }

      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
    } catch (err) {
      log.error(err);
      return Promise.reject(err);
    }

    return Promise.resolve(data);
  }

  /**
   * Update.
   *
   * @param {string} id
   * @param {T} data
   * @returns {Promise<T | undefined>}
   */
  async update(id: string, data: T): Promise<T | undefined> {
    // Refer to https://cloud.google.com/firestore/docs/manage-data/add-data
    // on updating nested objects and difference between set & update functions.
    // set replaces existing document with the new copy.
    try {
      const docRef = this.db.collection(this.fireStoreCollection.name).doc(id);
      const result = await docRef.set(data);
      return result.id;
    } catch (err) {
      log.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Delete.
   *
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.db.collection(this.fireStoreCollection.name).doc(id);
      return await docRef.delete();
    } catch (err) {
      log.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Returns all documents containing search term in the field of type array.
   *
   * @param {string} fieldName Field to search
   * @param {string} searchValue Value to look for
   */
  async arrayContains(fieldName: string, searchValue: string): Promise<T[]> {
    try {
      const data: Array<T> = [];
      log.debug('repository:arrayContainsAny');
      const snapshot = await this.db
        .collection(this.fireStoreCollection.name)
        .where(fieldName, 'array-contains', searchValue)
        .get();

      if (snapshot.empty) {
        log.debug(
          `No matching documents found ${fieldName}[] containing ${searchValue}`
        );
      }

      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      return Promise.resolve(data);
    } catch (e) {
      log.error(e);
      return Promise.reject(e);
    }
  }
}

export default RepositoryService;
