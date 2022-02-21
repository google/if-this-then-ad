import { Token } from '../interfaces/token';

/**
 * User class.
 */
export class User {
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
  deserialize(input: any): User {
    Object.assign(this, input);

    return this;
  }
}
