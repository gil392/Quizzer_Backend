import { z } from 'zod';
import {
    authenticatedRequestZodSchema,
    loginRequestZodSchema,
    registerRequestZodSchema
} from './validators';

export type AuthenticationTokens = {
    accessToken: string;
    refreshToken: string;
};

export type AuthenticationTokenPayload = {
    _id: string;
    random: string;
};

export type AuthenticatedRequest = z.infer<
    typeof authenticatedRequestZodSchema
>;

export type RegisterRequest = z.infer<typeof registerRequestZodSchema>;
export type LoginRequest = z.infer<typeof loginRequestZodSchema>;
