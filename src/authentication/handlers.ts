import bcrypt from 'bcrypt';
import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import {
    BadRequestError,
    InternalServerError,
    RequestHandlingError
} from '../services/server/exceptions';
import { UsersDal } from '../user/dal';
import { AuthConfig, REFRESH_TOKEN_COOKIE_NAME } from './config';
import { AuthenticationTokens } from './types';
import { generateTokens, hashPassword, verifyRefreshToken } from './utils';
import {
    validateLoginRequest,
    validateRegisterRequest,
    validateRequestWithRefreshToken
} from './validators';

const responseSendTokensAndUserId = (
    response: Response,
    userId: string | Types.ObjectId,
    tokens: AuthenticationTokens
) => {
    response.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
        sameSite: 'strict',
        httpOnly: true
    });
    response.send({ token: tokens.accessToken, userId });
};

export const register = (usersDal: UsersDal) =>
    validateRegisterRequest(async (request, response) => {
        const { username, email, password } = request.body;
        const hashedPassword = await hashPassword(password);
        try {
            await usersDal.create({
                username,
                email,
                hashedPassword,
                streak: 0
            });
            response.sendStatus(StatusCodes.CREATED);
        } catch (err) {
            const error = err as Error;
            if ('code' in error && error.code === 11000) {
                throw new BadRequestError('failed register');
            }
            throw error;
        }
    });

export const login = (authConfig: AuthConfig, usersDal: UsersDal) =>
    validateLoginRequest(async (request, response) => {
        const { username, password } = request.body;
        try {
            const user = await usersDal.findByUsername(username);
            if (!user) {
                throw new BadRequestError('wrong username or password');
            }
            const validPassword = await bcrypt.compare(
                password,
                user.hashedPassword
            );
            if (!validPassword) {
                throw new BadRequestError('wrong username or password');
            }
            const userId = user._id.toString();
            const tokens = generateTokens(authConfig, userId);
            if (!tokens) {
                throw new InternalServerError();
            }
            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();
            responseSendTokensAndUserId(response, userId, tokens);
        } catch (err) {
            throw err instanceof RequestHandlingError
                ? err
                : new BadRequestError('failed to login', err as Error);
        }
    });

export const logout = (tokenSecret: string) =>
    validateRequestWithRefreshToken(async (request, response) => {
        try {
            const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];
            const user = await verifyRefreshToken(tokenSecret, refreshToken);
            await user.save();
            response.cookie(REFRESH_TOKEN_COOKIE_NAME, '', {
                sameSite: 'strict',
                httpOnly: true
            });
            response.sendStatus(StatusCodes.OK);
        } catch (err) {
            response.status(StatusCodes.BAD_REQUEST).send(err);
        }
    });

export const refresh = (authConfig: AuthConfig) =>
    validateRequestWithRefreshToken(async (request, response) => {
        const { tokenSecret } = authConfig;
        const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE_NAME];

        try {
            const user = await verifyRefreshToken(tokenSecret, refreshToken);
            const userId = user._id.toString();
            const tokens = generateTokens(authConfig, userId);

            if (!tokens) {
                response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
                return;
            }
            if (!user.refreshToken) {
                user.refreshToken = [];
            }
            user.refreshToken.push(tokens.refreshToken);
            await user.save();
            responseSendTokensAndUserId(response, userId, tokens);
        } catch (err) {
            response.status(StatusCodes.BAD_REQUEST).send(err);
        }
    });
