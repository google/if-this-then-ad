import { Token } from "../interfaces/token";

export class User {
  id? : string;
  profileId: string;
  displayName: string;
  profilePhoto: string;
  token: Token;

  static fromJSON(input: any): User {
    return Object.assign(new User(), JSON.parse(input));
  }
}