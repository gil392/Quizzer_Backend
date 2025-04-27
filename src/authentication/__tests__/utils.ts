import { Express, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request, { Response as SuperTestResponse } from 'supertest';
import { User } from '../../user/model';
import { AuthenticatedRequest, RegisterRequest } from '../types';

export const createUserAuthenticationToken = async (
    app: Express,
    user: RegisterRequest['body']
) => {
    const oldTokenExpire = process.env.TOKEN_EXPIRES;
    process.env.TOKEN_EXPIRES = '3h';
    const registerResponse = await request(app)
        .post('/auth/register')
        .send(user);
    const loginResponse = await request(app).post('/auth/login').send(user);
    process.env.TOKEN_EXPIRES = oldTokenExpire;
    if (
        registerResponse.status !== StatusCodes.CREATED ||
        !loginResponse.body.accessToken
    ) {
        throw new Error('failed creating auth token');
    }

    return loginResponse.body.accessToken;
};

export const createTestingAuthMiddlewareWithUser =
    (user: User & { _id: Types.ObjectId }) =>
    (request: Request, _response: Response, next: NextFunction) => {
        (request as unknown as AuthenticatedRequest).user = {
            id: user._id.toString()
        };
        next();
    };

export const extractRefreshTokenFromResponseHeader = (
    response: SuperTestResponse
): string =>
    /[^;]+=(?<refreshToken>[^;]+);/.exec(response.headers['set-cookie'][0])!
        .groups!.refreshToken;
