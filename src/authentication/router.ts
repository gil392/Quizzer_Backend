import { RequestHandler, Router } from 'express';
import { AuthConfig } from './config';
import * as handlers from './handlers';
import { UserModel } from '../user/model';
import { UsersDal } from '../user/dal';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export type AuthRouterDependencies = {
    usersDal: UsersDal;
};

const buildRouteHandlers = (
    config: AuthConfig,
    dependencies: AuthRouterDependencies
): Record<keyof typeof handlers, RequestHandler> => ({
    login: handlers.login(config, dependencies.usersDal),
    logout: handlers.logout(config.tokenSecret),
    refresh: handlers.refresh(config),
    register: handlers.register(dependencies.usersDal)
});

export const createAuthRouter = (
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: registers a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - email
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 description: username of the user
     *               email:
     *                 type: string
     *                 description: email of the user
     *               password:
     *                 type: string
     *                 description: password of the user
     *             example:
     *               username: "user123"
     *               email: "useremail@gmail.com"
     *               password: "123456"
     *     responses:
     *       201:
     *         description: user registered
     */
    router.post('/register', handlers.register);

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: User login
     *     description: Authenticate user and return tokens
     *     tags:
     *       - Auth
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - username
     *               - password
     *             properties:
     *               username:
     *                 type: string
     *                 description: username of the user
     *               password:
     *                 type: string
     *                 description: password of the user
     *           example:
     *             username: "user123"
     *             password: "123456"
     *     responses:
     *       200:
     *         description: Successful login
     *         headers:
     *           Set-Cookie:
     *             schema:
     *               type: string
     *               example: refresh-token=someAuthToken123; HttpOnly;
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: access token for the user
     *                 userId:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: the user id
     *       400:
     *         description: Invalid credentials or request
     *       500:
     *         description: Server error
     */
    router.post('/login', handlers.login);

    /**
     * @swagger
     * /auth/refresh:
     *   get:
     *     summary: Refresh tokens
     *     description: Refresh access and refresh tokens using the provided refresh token
     *     tags:
     *       - Auth
     *     parameters:
     *       - in: cookie
     *         name: refresh-token
     *         schema:
     *           type: string
     *         required: true
     *         description: user jwt refresh token
     *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Tokens refreshed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: access token for the user
     *                 _id:
     *                   type: string
     *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *                   description: the user id
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.get('/refresh', handlers.refresh);

    /**
     * @swagger
     * /auth/logout:
     *   post:
     *     summary: User logout
     *     description: Logout user and invalidate the refresh token
     *     tags:
     *       - Auth
     *     parameters:
     *       - in: cookie
     *         name: refresh-token
     *         schema:
     *           type: string
     *         required: true
     *         description: user jwt refresh token
     *         example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     *     responses:
     *       200:
     *         description: Successful logout
     *       400:
     *         description: Invalid refresh token
     *       500:
     *         description: Server error
     */
    router.post('/logout', handlers.logout);

    return router;
};
