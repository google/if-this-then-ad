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

import {Strategy} from 'passport-google-oauth20';
import {log, date} from '@iftta/util';
import {PassportStatic} from 'passport';
import {Request} from 'express';
import Repository from '../services/repository-service';
import Collections from '../services/collection-factory';
import {User} from '../models/user';
import {Collection} from '../models/fire-store-entity';

const usersCollection = Collections.get(Collection.USERS);
const userRepo = new Repository<User>(usersCollection);
/**
 * Configuring Google Strategy
 */
class GoogleStrategy {
    /**
     * Configures passport strategy
     *
     * @param {PassportStatic} _passport Passport to Initialise
     */
    public static initialise(_passport: PassportStatic): any {
        if (typeof process.env.OAUTH_CALLBACK_URL == 'undefined') {
            throw new Error(
                'OAUTH_CALLBACK_URL undefined, it must be defined as environment variable'
            );
        }
        log.warn(
            `Set oauth callback URL to ${process.env.OAUTH_CALLBACK_URL}, adjust Authorized URLs in GCP client settings accordingly`
        );

        const googleStrategy = new Strategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: process.env.OAUTH_CALLBACK_URL,
                passReqToCallback: true,
                scope: [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/display-video',
                    'https://www.googleapis.com/auth/adwords',
                ],
            },
            async (
                req: Request,
                accessToken: string,
                refreshToken: string,
                profile: any,
                done: any
            ) => {
                // this is the callback method called after
                // successful authentication
                log.debug(`Profile : ${JSON.stringify(profile, null, 2)}`);

                const jsonProfile = JSON.parse(profile._raw);

                const userData: User = {
                    profileId: profile.id,
                    displayName: profile.displayName,
                    givenName: profile.name.givenName,
                    familyName: profile.name.familyName,
                    email: jsonProfile.email,
                    verified: jsonProfile.email_verified,
                    gender: profile.gender,
                    profilePhoto: jsonProfile.picture,
                    locale: jsonProfile.locale,
                    token: {
                        access: accessToken,
                        expiry: date.add(Date.now(), {seconds: 3599}), // expire access Tokens after 3599 sec.
                        refresh: refreshToken,
                        provider: profile.provider,
                        type: 'Bearer',
                    },
                };

                log.debug(`User : ${JSON.stringify(userData, null, 2)}`);

                // check if the user exists in db
                const userResults = await userRepo.getBy(
                    'profileId',
                    profile.id
                );

                if (userResults.length == 0) {
                    userData.id = await userRepo.save(userData);
                } else {
                    // return existing user from db
                    const existingUser = userResults[0]; // we are sure profileIds are unique
                    // update access token and expiry time.
                    existingUser.token.access = userData.token.access;
                    existingUser.token.expiry = date.add(Date.now(), {
                        seconds: 3599,
                    });
                    await userRepo.update(existingUser.id!, existingUser);
                    delete existingUser.token.refresh;
                    return done(null, existingUser, true);
                }

                // delete tokens otherwise they will be put into user session
                delete userData.token.refresh;
                return done(null, userData, true);
            }
        );

        _passport.use(googleStrategy);
    }
}

export default GoogleStrategy;
