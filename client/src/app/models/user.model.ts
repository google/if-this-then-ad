import { Token } from '../interfaces/token';

/**
 * User class.
 */
export class User {
  id?: string;
  profileId: string;
  displayName: string;
  profilePhoto: string;
  token: Token;

  /**
   * Parse User from JSON Object.
   *
   * @param {any} input
   * @returns {User}
   */
  static fromJSON(input: any): User {
    return Object.assign(new User(), JSON.parse(input));
  }
}
