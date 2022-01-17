import { Strategy } from 'passport-google-oauth20';
import log from '../util/logger';
import { PassportStatic } from 'passport';
import { Request } from 'express';
import Repository from '../services/repositoryService';
import Collections from '../services/collectionFactory';

const usersCollection = Collections.get('users');
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

        let CALLBACK_URL:string = '';
        
        if(process.env.WEB_HOST != typeof('undefined') || process.env.WEB_HOST as string != ''){
            CALLBACK_URL = 'https://' + process.env.PORT + '-' + process.env.WEB_HOST + process.env.CALLBACK_ENDPOINT;
            log.warn(`Set oauth callback URL to ${CALLBACK_URL}, adjust Authorized URLs in GCP client settings accordingly`);
        }
        
        _passport.use(
            new Strategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: CALLBACK_URL || process.env.OAUTH_CALLBACK_URL ,
                    passReqToCallback: true,
                },
                async (
                    req: Request,
                    accessToken: string,
                    refreshToken: string,
                    profile: any,
                    done: any,
                ) => {
                    // this is the callback method called after
                    // successful authentication
                    // console.log(profile)
                    
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
                        authToken: accessToken,
                        refreshToken: refreshToken,
                        locale: jsonProfile.locale,
                        tokenProvider: profile.provider,
                    };



                    log.debug(`User : ${JSON.stringify(userData, null, 4)}`);

                    // check if the user exists in db
                    const userResults = await userRepo.getBy('profileId', profile.id);

                    if (userResults.length == 0) {
                        await userRepo.save(userData);
                    }

                    return done(null, userData, true);
                },
            ),
        );
    }
}

export default GoogleStrategy;
