import { RequestHandler, Router } from "express";
import { UsersDal } from "../user/dal";
import * as handlers from "./handlers";
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
  getLoggedUser: handlers.getLoggedUser(dependencies.usersDal),
  editUser: handlers.editUser(dependencies.usersDal),
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
  router.get("/me", authMiddleware, handlers.getLoggedUser);

  /**
   * @swagger
   * /api/user:
   *   put:
   *     summary: Update user attributes
   *     description: Update an existing user
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: user new username
   *                 example: new user username
   *               settings:
   *                 type: Settings
   *                 description: user settings in Quizzer
   *                 example: Dark Mode
   *     responses:
   *       200:
   *         description: user updated successfully
   *       400:
   *         description: Invalid input
   *       404:
   *         description: user not found
   *       500:
   *         description: Server error
   */
  router.put("/", authMiddleware, handlers.editUser);

  return router;
};
