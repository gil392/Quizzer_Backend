import { StatusCodes } from 'http-status-codes';
import { dissoc } from 'ramda';
import request from 'supertest';
import { createDatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { UsersDal } from '../../user/dal';
import { createTestEnv } from '../../utils/tests/utils';
import { createAuthConfig, REFRESH_TOKEN_COOKIE_NAME } from '../config';
import { injectUserToRequest } from '../middlewares';
import { createAuthRouter } from '../router';
import { LoginRequest, RegisterRequest } from '../types';
import { generateTokens, hashPassword } from '../utils';
import { extractRefreshTokenFromResponseHeader } from './utils';

describe('authentication tests', () => {
    const env = createTestEnv({ AUTH_TOKEN_EXPIRES: '3s' });
    const authConfig = createAuthConfig(env);
    const database = new Database(createDatabaseConfig(env));
    const { userModel } = database.getModels();
    const usersDal = new UsersDal(userModel);

    const app = createBasicApp();
    const authRouter = createAuthRouter(createAuthConfig(env), { usersDal });
    app.use('/auth', authRouter);
    // const app = createTestingAppForRouter('/auth', authRouter);
    const testAuthenticatedRoute = '/authTestRoute';
    app.get(
        testAuthenticatedRoute,
        injectUserToRequest(authConfig.tokenSecret),
        (_req, res) => {
            res.sendStatus(StatusCodes.OK);
        }
    );

    const routeInAuthRouter = (route: string) => '/auth' + route;
    const testUserLogin: LoginRequest['body'] = {
        password: '123456',
        username: 'tester'
    };
    const testUserRegister: RegisterRequest['body'] = {
        ...testUserLogin,
        email: 'tomercpc01@gmail.com'
    };

    const requestLoginUser = () =>
        request(app).post(routeInAuthRouter('/login'));

    const loginUser = async (user: LoginRequest['body']) => {
        const response = await requestLoginUser().send(user);
        expect(response.status).toBe(StatusCodes.OK);

        return response;
    };

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });
    beforeEach(async () => {
        const { username, email, password } = testUserRegister;
        const hashedPassword = await hashPassword(password);
        await userModel.create({ username, email, hashedPassword });
    });
    afterEach(async () => {
        await userModel.deleteMany();
    });

    describe('register', () => {
        beforeEach(async () => {
            await userModel.deleteMany();
        });

        const requestRegisterUser = () =>
            request(app).post(routeInAuthRouter('/register'));

        test('register new user shold create user', async () => {
            const response = await requestRegisterUser().send(testUserRegister);

            expect(response.status).toBe(StatusCodes.CREATED);
        });

        test('register exisitng user shold return BAD_REQUEST', async () => {
            const registerResponse = await requestRegisterUser().send(
                testUserRegister
            );
            const registerExistingResponse = await requestRegisterUser().send({
                ...testUserRegister,
                password: 'otherPassword'
            });

            expect(registerResponse.status).toBe(StatusCodes.CREATED);
            expect(registerExistingResponse.status).toBe(
                StatusCodes.BAD_REQUEST
            );
        });

        test('missing email should return BAD_REQUEST', async () => {
            const user = dissoc('email', testUserRegister);
            const response = await requestRegisterUser().send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing username should return BAD_REQUEST', async () => {
            const user = dissoc('username', testUserRegister);
            const response = await requestRegisterUser().send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing password shold return BAD_REQUEST', async () => {
            const user = dissoc('password', testUserRegister);
            const response = await requestRegisterUser().send(user);

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('login', () => {
        test('user login should return tokens', async () => {
            const response = await loginUser(testUserLogin);
            const { accessToken } = response.body;

            expect(response.body._id).toBeDefined();
            expect(accessToken).toBeDefined();
            expect(response.headers['set-cookie']).toStrictEqual(
                expect.arrayContaining([
                    expect.stringContaining(REFRESH_TOKEN_COOKIE_NAME)
                ])
            );
        });

        test('login should return different tokens for each login', async () => {
            const firstLogin = await loginUser(testUserLogin);
            const secondLogin = await loginUser(testUserLogin);

            const { accessToken: firstLoginAccesToken } = firstLogin.body;
            const { accessToken: secondLoginAccesToken } = secondLogin.body;

            expect(firstLoginAccesToken).not.toBe(secondLoginAccesToken);
            expect(firstLogin.headers['set-cookie']).not.toStrictEqual(
                secondLogin.headers['set-cookie']
            );
        });

        test('incorrect password should return BAD_REQUEST', async () => {
            const response = await requestLoginUser().send({
                ...testUserLogin,
                password: 'randomPassword'
            });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('not exisitnig username should return BAD_REQUEST', async () => {
            const response = await requestLoginUser().send({
                ...testUserLogin,
                username: 'randomUsername'
            });

            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });
    });

    describe('logout', () => {
        test(
            'logout should remove all user refresh tokens',
            async () => {
                const loginResponse = await loginUser(testUserLogin);
                expect(loginResponse.statusCode).toBe(StatusCodes.OK);
                const { _id: userId } = loginResponse.body;

                const logoutResponse = await request(app)
                    .post(routeInAuthRouter('/logout'))
                    .set('Cookie', loginResponse.headers['set-cookie']);
                expect(logoutResponse.statusCode).toBe(StatusCodes.OK);

                const user = await userModel.findById(userId);
                expect(user).toBeDefined();
                expect(user!.refreshToken?.length).toBe(0);
            },
            10 * 60_000
        );
    });

    describe('refresh token', () => {
        test('not existing refresh token should return BAD_REQUEST and empty user refresh tokens', async () => {
            const loginResponse = await loginUser(testUserLogin);
            const userId = loginResponse.body._id;
            const tokens = generateTokens(authConfig, userId)!;
            expect(tokens).toBeDefined();
            const { refreshToken } = tokens!;

            const refreshResponse = await request(app)
                .get(routeInAuthRouter('/refresh'))
                .set('Cookie', `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}`);

            const user = await userModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.BAD_REQUEST);
            expect(user?.refreshToken?.length).toBe(0);
        });

        test('refresh should insert new refresh token to user', async () => {
            const loginResponse = await loginUser(testUserLogin);
            const { _id: userId } = loginResponse.body;
            const refreshToken =
                extractRefreshTokenFromResponseHeader(loginResponse);

            const refreshResponse = await request(app)
                .get(routeInAuthRouter('/refresh'))
                .set('Cookie', loginResponse.headers['set-cookie']);

            const user = await userModel.findById(userId);
            expect(refreshResponse.status).toBe(StatusCodes.OK);
            expect(user?.refreshToken?.length).toBeGreaterThan(0);
            expect(user?.refreshToken).not.toContain(refreshToken);
        });

        const requestAuthenticatedRoute = (accessToken: string) =>
            request(app)
                .get(testAuthenticatedRoute)
                .set({ authorization: 'JWT ' + accessToken });

        test('refresh expired token should return valid token', async () => {
            const loginResponse = await loginUser(testUserLogin);
            const { accessToken } = loginResponse.body;
            // wait for the token to expire
            await new Promise((resolve) => setTimeout(resolve, 5_000));

            const createPostResponse = await requestAuthenticatedRoute(
                accessToken
            );
            expect(createPostResponse.status).toBe(StatusCodes.UNAUTHORIZED);

            const refreshResponse = await request(app)
                .get(routeInAuthRouter('/refresh'))
                .set('Cookie', loginResponse.headers['set-cookie']);

            expect(refreshResponse.status).toBe(StatusCodes.OK);
            const newAccessToken = refreshResponse.body.accessToken;

            const createPostResponseWithValidToken =
                await requestAuthenticatedRoute(newAccessToken);
            expect(createPostResponseWithValidToken.status).toBe(
                StatusCodes.OK
            );
        }, 10_000);
    });
});
