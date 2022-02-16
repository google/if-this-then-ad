import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import { Collection } from '../models/fire-store-entity';
import { log, date } from '@iftta/util';
import axios from 'axios';
import { User, Token } from 'models/user';
import { setting } from './interfaces';

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
            return Promise.reject(err);
        }
    }
    /**
     * Gets settings e.g api keys for use with the agent.
     * @param {string} userId
     * @param {string} agentId
     */
    public async getUserSettingsForAgent(
        userId: string,
        agentId: string,
    ): Promise<setting | undefined> {
        try {
            const user: User = (await this.repo.get(userId)) as User;

            if (Array.isArray(user.settings)) {
                const agentSettings = user.settings!.filter((s) => {
                    return s.agentId == agentId;
                });

                if (agentSettings.length > 0) {
                    return Promise.resolve(agentSettings[0]);
                }
            }
            return undefined;
        } catch (err) {
            return Promise.reject(err);
        }
    }
}

export default new TaskConfiguration('https://oauth2.googleapis.com/token', userRepository);
