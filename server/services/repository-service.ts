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

import log from '../util/logger';


class RepositoryService<T> {

    db: any;
    fireStoreCollection: FirestoreCollection;

    constructor(collection: FirestoreCollection) {
       
        if(collection.name == "" || collection == null){
            throw new Error('Collection name must be specified');
        }
        this.fireStoreCollection = collection;
        this.db = collection.db;
    }

    async save<T >(obj: T): Promise<string> {
        log.debug('Attempting write to firestore');
        log.debug(obj);
        const collectionRef = this.db.collection(this.fireStoreCollection.name);
        const result = await collectionRef.add(obj);
        log.debug('Saved entity with id :' + result.id);
        return result.id;
    }

    async list(): Promise<T[]> {

        const collection = await this.db.collection(this.fireStoreCollection.name).get();

        let data: T[] = [];

        collection.forEach((entry) => {
            data.push({ id: entry.id, ...entry.data() });
        });

        log.debug(data);
        return data;
    }

    async get(id:string):Promise<T> {

        const docRef = this.db.collection(this.fireStoreCollection.name).doc(id);
        const doc = await docRef.get(); 

        if(!doc.exists){
            log.info(`Document with id : ${id} not found`);
        }
        const data:T = {id:doc.id, ...doc.data()};
        
        return data;
    }

    async getBy(fieldName:any, fieldValue: string |number | boolean):Promise<T[]> {
        const colRef = this.db.collection(this.fireStoreCollection.name);
        const snapshot = await colRef.where(fieldName, '==', fieldValue).get();

        if(snapshot.empty){
            log.debug(`No matching documents found for ${fieldName} : ${fieldValue}`);
        }

        let data:Array<T> = [];

        snapshot.forEach((doc)=> {
            data.push({id:doc.id, ...doc.data()});
        });

        return Promise.resolve(data);
    }

    async update(id:string, data:T):Promise<T>{
        const docRef = this.db.collection(this.fireStoreCollection.name).doc(id);
 
        // Refer to https://cloud.google.com/firestore/docs/manage-data/add-data 
        // on updating nested objects and difference between set & update functions.
        // set replaces existing document with the new copy. 
        const result = await docRef.set(data); 
        return result; 
    }

    async delete(id:string):Promise<T>{
        const docRef = this.db.collection(this.fireStoreCollection.name).doc(id); 
        return await docRef.delete();

    }

}

export default RepositoryService;