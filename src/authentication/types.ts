import { z } from 'zod';
import { authenticatedRequestZodSchema } from './validators';

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
