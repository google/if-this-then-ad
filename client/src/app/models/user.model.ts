import { Token } from "../interfaces/token";

export class User {
  profileId: string;
  displayName: string;
  profilePhoto: string;
  token: Token;

  deserialize(input: any): User {
    Object.assign(this, input);

    return this;
}
}