import { OAuth2Client } from 'google-auth-library';
import { User } from '../common/user';

/**
 * A helper class for Google authorized API calls.
 */
export class GoogleAuthService {
  /**
   * Returns an application-authorized OAuth2Client.
   * @returns {OAuth2Client} the application-authorized client
   */
  getClient() {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    return new OAuth2Client(clientId, clientSecret);
  }

  /**
   * Returns a user-authorized OAuth2Client.
   * @param {User} user the user for which to authorize.
   * @returns {OAuth2Client} the user-authorized client
   */
  getAuthorizedClientForUser(user: User) {
    const client = this.getClient();
    client.setCredentials({
      access_token: user.credentials.accessToken,
      expiry_date: user.credentials.expiry.getTime(),
      refresh_token: user.credentials.refreshToken,
    });
    return client;
  }
}

/**
 * The default singleton google auth service.
 */
export const googleAuthService = new GoogleAuthService();
