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

import {
  DocumentData,
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SetOptions,
  Timestamp,
} from '@google-cloud/firestore';
import { Model, ModelSpec } from '../common/common';
import { logger } from '../util/logger';

/**
 * A firebase data converter that converts dates to timestamps.
 */
class FirebaseDateConverter<T extends Model>
  implements FirestoreDataConverter<ModelSpec<T>>
{
  /**
   * Converts a object's date properties to firebase timestamps.
   * @param {unknown} value the object to convert
   * @param {string} fieldName an optional field path
   */
  private deepConvertToFirestore(value: unknown, fieldName = '') {
    if (value instanceof Object) {
      Object.entries(value as object).forEach(([field, fieldValue]) => {
        if (fieldValue instanceof Date) {
          logger.debug(`Converting date to timestamp: ${fieldName}.${field}`);
          value[field] = Timestamp.fromDate(fieldValue);
        } else {
          this.deepConvertToFirestore(fieldValue, field);
        }
      });
    }
  }
  /**
   * Converts a object's date properties to firebase timestamps.
   * @param {unknown} value the object to convert
   * @param {string} fieldName an optional field path
   */
  private deepConvertFromFirestore(value: unknown, fieldName: string = '') {
    if (value instanceof Object) {
      Object.entries(value as object).forEach(([field, fieldValue]) => {
        if (fieldValue instanceof Timestamp) {
          logger.debug(`Converting timestamp to date: ${fieldName}.${field}`);
          value[field] = fieldValue.toDate();
        } else {
          this.deepConvertFromFirestore(fieldValue);
        }
      });
    }
  }

  /**
   * @inheritdoc
   */
  toFirestore(modelObject: ModelSpec<T>): DocumentData;
  /**
   * @inheritdoc
   */
  toFirestore(
    modelObject: Partial<ModelSpec<T>>,
    options: SetOptions
  ): DocumentData;
  /**
   * @inheritdoc
   */
  toFirestore(
    modelObject: ModelSpec<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: unknown
  ): DocumentData {
    this.deepConvertToFirestore(modelObject);
    return modelObject;
  }

  /**
   * @inheritdoc
   */
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): ModelSpec<T> {
    const data = snapshot.data();
    this.deepConvertFromFirestore(data);
    return data as ModelSpec<T>;
  }
}

/**
 * A collection implementation for Firebase
 */
export class FirebaseCollection<T extends Model> {
  private dateConverter = new FirebaseDateConverter<T>();

  /**
   * Constructor
   * @param {string} name the name of this collection
   * @param {Firestore} firestore the underlying Firestore
   */
  constructor(readonly name: string, readonly firestore: Firestore) {}

  /**
   * Retrieves a single model from Firestore.
   * @param {string} id the model ID
   * @returns {Promise<T|undefined>} the model or undefined if no model with
   *    the given ID exists
   */
  async get(id: string): Promise<T | undefined> {
    logger.debug(['FirebaseCollection:get', id]);
    if (!id) {
      throw new Error('Document id cannot be empty');
    }

    try {
      const docRef = this.firestore
        .collection(this.name)
        .withConverter(this.dateConverter)
        .doc(id);

      const doc = await docRef.get();

      if (!doc.exists) {
        logger.info(`Document with id : ${id} not found`);
        return undefined;
      }
      return { id: doc.id, ...doc.data() } as T;
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }
  /**
   * Retrieves all model from Firestore
   * @returns {Promise<T[]>} the list of existing models
   */
  async list(): Promise<T[]> {
    const data: T[] = [];

    try {
      const collection = await this.firestore
        .collection(this.name)
        .withConverter(this.dateConverter)
        .get();

      collection.forEach((entry) => {
        data.push({ id: entry.id, ...entry.data() } as T);
      });
      logger.debug('Repository:list');
      logger.debug(data);
      return data;
    } catch (err) {
      logger.error(err);
      return Promise.reject(err);
    }
  }

  /**
   * Inserts a model.
   * @param {ModelSpec<T>} modelSpec the model data to insert
   * @returns {Promise<T>} the inserted model
   */
  async insert(modelSpec: ModelSpec<T>): Promise<T> {
    logger.debug('Saving data to firestore');
    logger.debug(modelSpec);
    try {
      const collectionRef = this.firestore.collection(this.name);
      const result = await collectionRef.add(modelSpec);
      logger.debug('Saved entity with id :' + result.id);
      return (await this.get(result.id))!;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Replaces a model's data.
   * @param {string} id the model ID
   * @param {ModelSpec<T>} modelSpec the model data to replace
   * @returns {Promise<T>} the updated model
   */
  async update(id: string, modelSpec: ModelSpec<T>): Promise<T> {
    // Refer to https://cloud.google.com/firestore/docs/manage-data/add-data
    // on updating nested objects and difference between set & update functions.
    // set replaces existing document with the new copy.
    try {
      const docRef = this.firestore.collection(this.name).doc(id);
      await docRef.set(modelSpec);
      return (await this.get(id))!;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Deletes a model.
   * @param {string} id the model ID.
   * @returns {Promise<void>} completes after model deletion
   */
  async delete(id: string): Promise<void> {
    try {
      const docRef = this.firestore.collection(this.name).doc(id);
      await docRef.delete();
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * Retrieves all models for which the value at the specified field path
   * matches the provided value.
   * @param {string} fieldSpec the field path
   * @param {unknown} value the value to match
   * @returns {Promise<T[]>} the models which match the value at the field path
   */
  async findWhere(fieldSpec: string, value: unknown): Promise<T[]> {
    logger.debug('Repository:getBy');
    const models: Array<T> = [];
    try {
      const colRef = this.firestore
        .collection(this.name)
        .withConverter(this.dateConverter);
      const snapshot = await colRef.where(fieldSpec, '==', value).get();

      if (snapshot.empty) {
        logger.debug(
          `Collection ${this.name} contains no document with field ${fieldSpec} : ${value}`
        );
      }

      snapshot.forEach((doc) => {
        models.push({ id: doc.id, ...doc.data() } as T);
      });
    } catch (err) {
      logger.error(err);
      throw err;
    }

    return Promise.resolve(models);
  }

  /**
   * Retrieves all models for which the array at the specified field path
   * contains the provided value.
   * @param {string} fieldSpec the field path
   * @param {unknown} value the value to match
   * @returns {Promise<T[]>} the models which contain the value at the field
   *    path
   */
  async findWhereArrayContains(
    fieldSpec: string,
    value: unknown
  ): Promise<T[]> {
    const data: T[] = [];
    logger.debug('repository:arrayContainsAny');
    const snapshot = await this.firestore
      .collection(this.name)
      .where(fieldSpec, 'array-contains', value)
      .withConverter(this.dateConverter)
      .get();

    if (snapshot.empty) {
      logger.debug(
        `No matching documents found ${fieldSpec}[] containing ${value}`
      );
    }

    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as T);
    });
    return data;
  }
}
