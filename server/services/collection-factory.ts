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
import {FirestoreCollection} from '../models/fire-store-entity'
const Firestore = require('@google-cloud/firestore');

class CollectionFactory {
    db: any;

    constructor() {
        this.db = new Firestore({
            projectId: 'if-this-then-ad',
        });
        this.db.settings({ignoreUndefinedProperties: true});
    }
    //TODO: Discuss if we want to have a method for each collection type
    // to reduce possibility of typos creeping in.
    public get(collectionName: string) {
        const collection: FirestoreCollection = {
            name: collectionName,
            db: this.db,
        };
        return collection;
    }
}

export default new CollectionFactory();
