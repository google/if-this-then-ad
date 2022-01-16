
interface User {
    id?:string
    profileId: number;
    displayName ?: string;
    givenName ?: string;
    familyName ?: string;
    gender ?: string;
    email: string ;
    verified ?: boolean;
    profilePhoto ?: string;
    locale ?: string;
    authToken ?: string;
    refreshToken ?: string;
    tokenProvider: string ;
}
