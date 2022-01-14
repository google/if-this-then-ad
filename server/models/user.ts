import {DatastoreEntity} from './datastoreEntity';


export default class User extends DatastoreEntity {
  entityName: string = 'user';
  profileId?: number;
  displayName?: string;
  givenName?: string;
  familyName?: string;
  gender?: string;
  email?: string;
  verified?: boolean;
  profilePhoto?: string;
  locale?: string;
  authToken?: string;
  refreshToken?: string;
  tokenProvider?: string;
}
