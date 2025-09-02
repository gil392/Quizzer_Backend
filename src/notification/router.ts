import { RequestHandler, Router } from "express";
import * as handlers from "./handlers";
import { NotificationsDal } from "./dal";
import { UsersDal } from "../user/dal";
import { LessonsDal } from "../lesson/dal";
import { AchievementsDal } from "../achivments/dal";

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API for /notifications
 */

export type NotificationRouterDependencies = {
  notificationDal: NotificationsDal;
  usersDal: UsersDal;
  lessonsDal: LessonsDal;
  achievementsDal: AchievementsDal;
};

const createNotificationController = ({
  notificationDal,
  usersDal,
  lessonsDal,
  achievementsDal,
}: NotificationRouterDependencies) => ({
  getNotificationsByUserId: handlers.getNotificationsByUserId(notificationDal),
  markNotificationAsRead: handlers.markNotificationAsRead(notificationDal),
  deleteNotification: handlers.deleteNotification(notificationDal),
  shareAchievement: handlers.shareAchievement(
    notificationDal,
    usersDal,
    achievementsDal
  ),
  shareLesson: handlers.shareLesson(notificationDal, usersDal, lessonsDal),
  notifyFriendRequest: handlers.notifyFriendRequest(notificationDal, usersDal),
});

export const createNotificationRouter = (
  authMiddleware: RequestHandler,
  dependecies: NotificationRouterDependencies
): Router => {
  const router = Router();
  const controller = createNotificationController(dependecies);

  /**
   * @swagger
   * /notifications:
   *   get:
   *     summary: Get all notifications for the authenticated user
   *     tags: [Notification]
   *     security:
   *      - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of notifications
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Notification'
   *             examples:
   *               example:
   *                 value:
   *                   - _id: "64e7c2f9b6e7c2f9b6e7c2f9"
   *                     toUserId: "64e7c2f9b6e7c2f9b6e7c2f8"
   *                     fromUserId: "64e7c2f9b6e7c2f9b6e7c2f7"
   *                     type: "share"
   *                     relatedEntityId: "64e7c2f9b6e7c2f9b6e7c2f6"
   *                     entityType: "lesson"
   *                     message: "Alice shared a lesson with you!"
   *                     read: false
   *                     createdAt: "2025-09-01T12:00:00.000Z"
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Notifications not found
   *       500:
   *         description: Internal server error
   */
  router.get("/", authMiddleware, controller.getNotificationsByUserId);

  /**
   * @swagger
   * /notifications/{id}/read:
   *   put:
   *     summary: Mark a notification as read
   *     tags: [Notification]
   *     security:
   *      - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Notification marked as read
   *       400:
   *         description: Invalid notification ID
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Notification not found
   *       500:
   *         description: Internal server error
   */
  router.put("/:id/read", authMiddleware, controller.markNotificationAsRead);

  /**
   * @swagger
   * /notifications/{id}:
   *   delete:
   *     summary: Delete a notification
   *     tags: [Notification]
   *     security:
   *      - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Notification with id 64e7c2f9b6e7c2f9b6e7c2f9 deleted successfully
   *       400:
   *         description: Invalid notification ID
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Notification not found
   *       500:
   *         description: Internal server error
   */
  router.delete("/:id", authMiddleware, controller.deleteNotification);

  /**
   * @swagger
   * /notifications/share-achievement:
   *   post:
   *     summary: Notify all friends about an achievement
   *     tags: [Notification]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - toUserIds
   *               - relatedEntityId
   *             properties:
   *               toUserIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of recipient user IDs
   *               relatedEntityId:
   *                 type: string
   *                 description: ID of the achievement to be shared
   *           example:
   *             toUserIds: ["64e7c2f9b6e7c2f9b6e7c2f8", "64e7c2f9b6e7c2f9b6e7c2f7"]
   *             relatedEntityId: "64e7c2f9b6e7c2f9b6e7c2f6"
   *     responses:
   *       201:
   *         description: Friends notified
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Friends notified
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Sender or achievement not found
   *       500:
   *         description: Internal server error
   */
  router.post(
    "/share-achievement",
    authMiddleware,
    controller.shareAchievement
  );

  /**
   * @swagger
   * /notifications/share-lesson:
   *   post:
   *     summary: Share a lesson with users
   *     tags: [Notification]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - toUserIds
   *               - relatedEntityId
   *             properties:
   *               toUserIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of recipient user IDs
   *               relatedEntityId:
   *                 type: string
   *                 description: ID of the lesson to be shared
   *           example:
   *             toUserIds: ["64e7c2f9b6e7c2f9b6e7c2f8", "64e7c2f9b6e7c2f9b6e7c2f7"]
   *             relatedEntityId: "64e7c2f9b6e7c2f9b6e7c2f6"
   *     responses:
   *       201:
   *         description: Notifications sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Notifications sent
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Sender or lesson not found
   *       500:
   *         description: Internal server error
   */

  router.post("/share-lesson", authMiddleware, controller.shareLesson);

  /**
   * @swagger
   * /notifications/friend-request:
   *   post:
   *     summary: Notify a user about a friend request
   *     tags: [Notification]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - toUserId
   *             properties:
   *               toUserId:
   *                 type: string
   *                 description: The user to notify
   *           example:
   *             toUserId: "64e7c2f9b6e7c2f9b6e7c2f8"
   *     responses:
   *       201:
   *         description: Friend request notification sent
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Friend request notification sent
   *       400:
   *         description: Invalid request body
   *       401:
   *         description: Unauthorized - missing or invalid token
   *       404:
   *         description: Sender not found
   *       500:
   *         description: Internal server error
   */
  router.post(
    "/friend-request",
    authMiddleware,
    controller.notifyFriendRequest
  );

  return router;
};