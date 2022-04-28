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
import { log, date } from '@iftta/util';
import axios from 'axios';
import { User, Token } from './../models/user';

const usersCollection = Collections.get(Collection.USERS);
const userRepository = new Repository<User>(usersCollection);

class TaskConfiguration {
    private tokenUrl = '';
    private repo: Repository<User>;

    constructor(tokenEndpoint: string, repository: Repository<User>) {
        this.tokenUrl = tokenEndpoint;
        this.repo = repository;
    }

    public async getNewAuthToken(refreshToken: string): Promise<Token> {
        try {
            log.debug(`Exchanging Refresh token  ${refreshToken} for Auth Token`);
            const grantType = 'refresh_token';
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            const clientId = process.env.GOOGLE_CLIENT_ID;

            const payload = {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: grantType,
                refresh_token: refreshToken,
            };

            const request = await axios.post(this.tokenUrl, payload);

            if (request.status == 200) {
                const token: Token = {
                    access: request.data.access_token,
                    expiry: date.add(Date.now(), { seconds: request.data.expires_in }),
                    refresh: refreshToken,
                    type: request.data.token_type,
                };

                log.info(`Obtained new access Token ${token.access}`);
                log.info(`Token expires in ${request.data.expires_in}`);

                log.debug(token);
                return token;
            }
        } catch (err) {
            log.error(err);
            return Promise.reject(err);
        }
        return Promise.reject('Couldnt obtain token, check logs for errors');
    }
    /**
     * Reissues a new token for the user, upon presentation of the old token
     * @param userId
     * @param accessToken
     */
    public async reissueAuthTokenForUser(userId: string, accessToken: string): Promise<Token> {
        if (!userId && !accessToken) {
            return Promise.reject('Both userId and expired access Token are required for renewal');
        }

        try {
            const user: User = (await this.repo.get(userId)) as User;
            if (user.token.access == accessToken) {
                const token = await this.refreshTokensForUser(userId);
                delete token.refresh;
                return token;
            }
            return Promise.reject('Refresh request denied');
        } catch (e) {
            log.error(e);
            return Promise.reject(e);
        }
    }
    public async refreshTokensForUser(userId: string): Promise<Token> {
        try {
            const user: User = (await this.repo.get(userId)) as User;

            if ((user != null || user != 'undefined') && date.isFuture(user.token.expiry)) {
                log.info(`Access token for user ${userId} is still valid`);
                return user.token;
            }
            log.info(`Noticed expired access token for user ${userId} , refreshing...`);
            const refreshToken: string = user.token.refresh as string;
            const newToken: Token = await this.getNewAuthToken(refreshToken);
            user.token.access = newToken.access;
            user.token.expiry = newToken.expiry;
            user.token.scope = newToken.scope;

            await this.repo.update(userId, user);

            return newToken;
        } catch (err) {
            log.error(['TaskConfiguration:refreshTokensForUser:Error', err as string]);
            return Promise.reject(err);
        }
    }
    /**
     * Gets settings e.g api keys for use with the agent.
     * @param {string} userId
     * @param {string} agentId
     */
    public async getUserSettings(userId: string): Promise<Object | undefined> {
        try {
            const user: User = (await this.repo.get(userId)) as User;
            return user?.userSettings;
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default new TaskConfiguration('https://oauth2.googleapis.com/token', userRepository);
