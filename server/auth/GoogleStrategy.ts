import {Strategy} from 'passport-google-oauth20';
import {User} from '../models/User';
import dotenv from 'dotenv';
import log from '../util/logger';
import {PassportStatic} from 'passport';
import {Request} from 'express';

/**
 * Configuring Google Strategy
 */
class GoogleStrategy {
    /**
     * Gets config
     * @return {any} configuration
     */
    private static getConfig(): any {
        const config = dotenv.config();
        if (config.error) {
            log.error('Error loading configuration from .env file');
            throw config.error;
        }

        return config.parsed;
    }

    /**
     * Configures passport strategy
     *
     * @param {PassportStatic} _passport Passport to Initialise
     */
    public static initialise(_passport: PassportStatic): any {
        const config = this.getConfig();
        _passport.use(
            new Strategy(
                {
                    clientID: config.GOOGLE_CLIENT_ID,
                    clientSecret: config.GOOGLE_CLIENT_SECRET,
                    callbackURL: config.OAUTH_CALLBACK_URL,
                    passReqToCallback: true,
                },
                (
                    req: Request,
                    accessToken: string,
                    refreshToken: string,
                    profile: any,
                    done: any
                ) => {
                    // this is the callback method called after successful authentication

                    const jsonProfile = JSON.parse(profile._raw);
                    const user: User = {
                        profileId: profile.id,
                        displayName: profile.displayName,
                        givenName: profile.name.givenName,
                        familyName: profile.name.familyName,
                        email: jsonProfile.email,
                        verified: jsonProfile.email_verified,
                        gender: profile.gender,
                        profilePhoto: jsonProfile.picture,
                        authToken: accessToken,
                        refreshToken: refreshToken,
                        locale: jsonProfile.locale,
                        tokenProvider: profile.provider,
                    };

                    log.debug(`User : ${JSON.stringify(user, null, 4)}`);

                    // check if the user exists in db
                    // if yes verify that same profile id
                    // if not create user and continue.

                    return done(null, user, true);
                }
            )
        );
    }
}

export default GoogleStrategy;
