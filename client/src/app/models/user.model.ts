import { Token } from "../interfaces/token";

export class User {
  id? : string;
  profileId: string;
  displayName: string;
  profilePhoto: string;
  token: Token;

  deserialize(input: any): User {
    Object.assign(this, input);

    return this;
  }

  static fromJSON(input: any): User {
    return Object.assign(new User(), JSON.parse(input));
  }


}