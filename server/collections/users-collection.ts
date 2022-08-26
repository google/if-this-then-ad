import { User } from 'common/user';
import { FirebaseCollection } from './firebase-collection';

/**
 * A firebase collection implementation with additional functionality for users.
 */
export class UsersCollection extends FirebaseCollection<User> {
  /**
   *
   * @param {string} accessToken
   * @returns {Promise<User|undefined>} the user or undefined if no user with
   *    access token can be found.
   */
  async findByAccessToken(accessToken: string): Promise<User | undefined> {
    const [user] = await this.findWhere('credentials.accessToken', accessToken);
    return user;
  }
}
