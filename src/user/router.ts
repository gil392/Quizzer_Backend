import { RequestHandler, Router } from 'express';
import { UsersDal } from '../user/dal';
import * as handlers from './handlers';
/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for /user
 */

export type UsersRouterDependencies = {
    usersDal: UsersDal;
};

const buildRouteHandlers = (
    dependencies: UsersRouterDependencies
): Record<keyof typeof handlers, RequestHandler> => ({
    getLoggedUser: handlers.getLoggedUser(dependencies.usersDal)
});

export const createUsersRouter = (
    authMiddleware: RequestHandler,
    ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
    const handlers = buildRouteHandlers(...buildHandlersParams);
    const router = Router();

    /**
     * @swagger
     * /api/user/me:
     *   get:
     *     summary: get logged user attributes
     *     description: get logged user attributes
     *     tags:
     *       - User
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: user public attributes
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/PublicUser'
     *       401:
     *         description: User is unauthorized
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    router.get('/me', authMiddleware, handlers.getLoggedUser);

    return router;
};
