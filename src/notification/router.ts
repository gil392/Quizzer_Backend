import { RequestHandler, Router } from "express";
import * as handlers from "./handlers";
import { NotificationsDal } from "./dal";
import { UsersDal } from "../user/dal";

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API for /notifications
 */

export type NotificationRouterDependencies = {
    notificationDal: NotificationsDal;
    usersDal: UsersDal;

};

const createNotificationController = ({
    notificationDal,
    usersDal
}: NotificationRouterDependencies) => ({
    getNotificationsByUserId: handlers.getNotificationsByUserId(notificationDal),
    markNotificationAsRead: handlers.markNotificationAsRead(notificationDal),
    deleteNotification: handlers.deleteNotification(notificationDal),
    shareAchievement: handlers.shareAchievement(notificationDal, usersDal),
    shareLesson: handlers.shareLesson(notificationDal, usersDal),
    notifyFriendRequest: handlers.notifyFriendRequest(notificationDal, usersDal)
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
     *     responses:
     *       200:
     *         description: List of notifications
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Notification'
     */
    router.get("/", authMiddleware, controller.getNotificationsByUserId);

    /**
     * @swagger
     * /notifications/{id}/read:
     *   put:
     *     summary: Mark a notification as read
     *     tags: [Notification]
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
     */
    router.put("/:id/read", authMiddleware, controller.markNotificationAsRead);

    /**
     * @swagger
     * /notifications/{id}:
     *   delete:
     *     summary: Delete a notification
     *     tags: [Notification]
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
     */
    router.delete("/:id", authMiddleware, controller.deleteNotification);


    /**
     * @swagger
     * /notifications/notify-friends-achievement:
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
     *               - relatedEntityId
     *             properties: {}
     *     responses:
     *       201:
     *         description: Friends notified
     */
    router.post("/share-achievement", authMiddleware, controller.shareAchievement);

    /**
     * @swagger
     * /notifications/share-lesson:
     *   post:
     *     summary: Share a quiz or summary with users
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
     *                 description: ID of the related quiz or summary
     *     responses:
     *       201:
     *         description: Notifications sent
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
     *     responses:
     *       201:
     *         description: Friend request notification sent
     */
    router.post("/friend-request", authMiddleware, controller.notifyFriendRequest);

    return router;
};