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
  searchUsers: handlers.searchUsers(dependencies.usersDal),
  answerFriendRequest: handlers.answerFriendRequest(dependencies.usersDal),
  createFriendRequest: handlers.createFriendRequest(dependencies.usersDal),
  getUserFriends: handlers.getUserFriends(dependencies.usersDal),
  getUserFriendsRequests: handlers.getUserFriendsRequests(
    dependencies.usersDal
  ),
});

export const createUsersRouter = (
  authMiddleware: RequestHandler,
  ...buildHandlersParams: Parameters<typeof buildRouteHandlers>
) => {
  const handlers = buildRouteHandlers(...buildHandlersParams);
  const router = Router();

  /**
   * @swagger
   * /user/me:
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
   * /user/search:
   *   get:
   *     summary: Search for users by username or email
   *     description: Returns a list of users that match the search query using partial or fuzzy matching.
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: true
   *         schema:
   *           type: string
   *         description: The search term to filter users by username or email.
   *     responses:
   *       200:
   *         description: A list of matching users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   username:
   *                     type: string
   *                     example: tomer
   *                   email:
   *                     type: string
   *                     format: email
   *                     example: tomer@example.com
   *                   picture:
   *                     type: string
   *                     format: uri
   *                     nullable: true
   *                     example: https://example.com/avatar.jpg
   *       400:
   *         description: Missing or invalid query parameter
   *       401:
   *         description: User is unauthorized
   *       500:
   *         description: Server error
   */
  router.get("/search", handlers.searchUsers);

  /**
   * @swagger
   * /user/friend/requests:
   *   get:
   *     summary: Get incoming friend requests
   *     description: Retrieves a list of users who sent friend requests to the authenticated user.
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of users who sent friend requests
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/PublicUser'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get(
    "/friend/requests",
    authMiddleware,
    handlers.getUserFriendsRequests
  );

  /**
   * @swagger
   * /friend:
   *   get:
   *     summary: Get user's friends
   *     description: Retrieves a list of users who are friends with the authenticated user.
   *     tags:
   *       - User
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of user's friends
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/PublicUser'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       500:
   *         description: Internal server error
   */
  router.get("/friend", authMiddleware, handlers.getUserFriends);

  /**
   * @swagger
   * /user/friend:
   *   post:
   *     summary: Send a friend request
   *     description: Authenticated user sends a friend request to another user.
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
   *             required:
   *               - user
   *             properties:
   *               user:
   *                 type: string
   *                 description: ID of the user to send a friend request to
   *             example:
   *               user: "user123"
   *     responses:
   *       201:
   *         description: Friend request created successfully
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized - invalid or missing token
   *       404:
   *         description: Target user not found
   *       409:
   *         description: Already friends or request already sent
   */
  router.post("/friend", authMiddleware, handlers.createFriendRequest);

  /**
   * @swagger
   * /user/friend/answer:
   *   put:
   *     summary: Respond to a friend request
   *     description: Accept or decline a pending friend request.
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
   *             required:
   *               - friendRequester
   *               - accepted
   *             properties:
   *               friendRequester:
   *                 type: string
   *                 description: ID of the user who sent the friend request
   *               accepted:
   *                 type: boolean
   *                 description: Whether the friend request is accepted (true) or declined (false)
   *             example:
   *               friendRequester: "user123"
   *               accepted: true
   *     responses:
   *       200:
   *         description: Friend request answered successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Friend request not found
   */
  router.put("/friend/answer", authMiddleware, handlers.answerFriendRequest);

  return router;
};
