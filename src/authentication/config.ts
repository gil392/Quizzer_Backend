import { SignOptions } from 'jsonwebtoken';
import { ProcessEnv } from '../config';

export const REFRESH_TOKEN_COOKIE_NAME = 'refresh-token';

export type AuthConfig = {
    tokenSecret: string;
    tokenExpires: SignOptions['expiresIn'];
    refreshTokenExpires: SignOptions['expiresIn'];
    googleClientId: string;
    googleClientSecret: string;
    sessionSecret: string;
    googleCallbackUrl: string;
    frontendRedirectUrl: string;
};

export const createAuthConfig = (env: ProcessEnv): AuthConfig => ({
    tokenSecret: env.AUTH_TOKEN_SECRET,
    tokenExpires: env.AUTH_TOKEN_EXPIRES as SignOptions['expiresIn'],
    refreshTokenExpires:
        env.AUTH_REFRESH_TOKEN_EXPIRES as SignOptions['expiresIn'],
    googleClientId: env.AUTH_GOOGLE_CLIENT_ID,
    googleClientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    sessionSecret: env.AUTH_SESSION_SECRET,
    googleCallbackUrl: env.AUTH_GOOGLE_CALLBACK_URL, 
    frontendRedirectUrl: env.AUTH_FRONTEND_REDIRECT_URL,

});
