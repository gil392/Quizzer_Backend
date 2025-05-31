import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '../services/server/exceptions';
import { userModel } from '../user/model';
import { AuthConfig } from './config';
import { AuthenticationTokenPayload, AuthenticationTokens } from './types';

const saltRounds = 10;

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
};

export const generateTokens = (
    authConfig: AuthConfig,
    userId: string
): AuthenticationTokens => {
    const random = Math.random().toString();
    const payload: AuthenticationTokenPayload = {
        _id: userId,
        random: random
    };
    const { tokenSecret, tokenExpires, refreshTokenExpires } = authConfig;

    const accessToken = jwt.sign(payload, tokenSecret, {
        expiresIn: tokenExpires
    });
    const refreshToken = jwt.sign(payload, tokenSecret, {
        expiresIn: refreshTokenExpires
    });

    return { accessToken, refreshToken };
};

export const verifyRefreshToken = async (
    tokenSecret: string,
    refreshToken: string
) => {
    const verifiedTokenPayload = jwt.verify(refreshToken, tokenSecret);
    if (typeof verifiedTokenPayload === 'string') {
        throw new BadRequestError('token payload shoud not be string');
    }

    const userId = verifiedTokenPayload._id;
    const user = await userModel.findById(userId);
    if (!user) {
        throw new BadRequestError('user not found');
    }
    if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
        user.refreshToken = [];
        await user.save();
        throw new BadRequestError('invalid refresh token');
    }
    const tokens = user.refreshToken!.filter((token) => token !== refreshToken);
    user.refreshToken = tokens;

    return user;
};
