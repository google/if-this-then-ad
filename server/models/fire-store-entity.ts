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
export interface FirestoreCollection {
    name: string;
    db: any;
}

const resolveCollectionName = (collection): string => {
    let prefix = '';
    if ('DEMO_ENV_NAME' in process.env && process.env.DEMO_ENV_NAME) {
        console.log(`Demo environment name ${process.env.DEMO_ENV_NAME}`);
        prefix = process.env.DEMO_ENV_NAME.replace('/', '-') + ':';
    }
    return prefix + collection;
}

/**
 * Allowed collection types for use with the
 * repository
 */
export const Collection = {
    USERS: resolveCollectionName('users'),
    RULES: resolveCollectionName('rules'),
    JOBS: resolveCollectionName('jobs'),
    SESSIONS: resolveCollectionName('sessions'),
}
