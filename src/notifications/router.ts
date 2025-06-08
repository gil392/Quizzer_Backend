import { RequestHandler, Router } from "express";
import * as handlers from "./handlers";
import { NotificationsDal } from "./dal";

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: API for /notifications
 */

export type NotificationRouterDependencies = {
    notificationDal: NotificationsDal;
};

const createNotificationController = ({
    notificationDal,
}: NotificationRouterDependencies) => ({
    getNotifications: handlers.getNotifications(notificationDal),
    markNotificationAsRead: handlers.markNotificationAsRead(notificationDal),
    deleteNotification: handlers.deleteNotification(notificationDal),
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
    router.get("/", authMiddleware, controller.getNotifications);

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

    return router;
};