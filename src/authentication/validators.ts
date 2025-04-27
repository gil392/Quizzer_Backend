import { z } from 'zod';
import { validateHandlerRequest } from '../services/server/validators';
import { REFRESH_TOKEN_COOKIE_NAME } from './config';

export const registerRequestZodSchema = z.object({
    body: z.object({
        username: z.string(),
        email: z.string().email(),
        password: z.string()
    })
});
export const validateRegisterRequest = validateHandlerRequest(
    registerRequestZodSchema
);

export const loginRequestZodSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string()
    })
});
export const validateLoginRequest = validateHandlerRequest(
    loginRequestZodSchema
);

const requestWithRefreshTokenCookie = z.object({
    cookies: z.object({
        [REFRESH_TOKEN_COOKIE_NAME]: z.string()
    })
});
export const validateRequestWithRefreshToken = validateHandlerRequest(
    requestWithRefreshTokenCookie
);

export const authenticatedRequestZodSchema = z.object({
    user: z.object(
        { id: z.string() },
        { message: 'user request is not authenticated' }
    )
});
export const validateAuthenticatedRequest = validateHandlerRequest(
    authenticatedRequestZodSchema
);
