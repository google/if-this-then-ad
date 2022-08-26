import { Model } from './common';

export interface Credentials {
  accessToken: string;
  expiry: Date;
  refreshToken: string;
}

export interface User extends Model {
  profileId: string;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  gender?: string;
  email: string;
  verified?: boolean;
  profilePhoto?: string;
  locale?: string;
  credentials: Credentials;
  settings: Record<string, string>;
}
