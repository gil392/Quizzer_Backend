import { StatusCodes } from "http-status-codes";
import { NotificationsDal } from "./dal";
import { UsersDal } from "../user/dal";
import {
    getNotificationsValidatorByUserId,
    markAsReadValidator,
    deleteNotificationValidator,
    shareAchievementValidator,
    shareLessonValidator,
    friendRequestValidator
} from "./validators";
import { isNil } from "ramda";
import { NotFoundError } from "../services/server/exceptions";

export const getNotificationsByUserId = (notificationsDal: NotificationsDal) =>
    getNotificationsValidatorByUserId(async (req, res) => {
        const { id: userId } = req.user;

        const notifications = await notificationsDal.findNotificationsByUserId(userId);

        if (isNil(notifications)) {
            throw new NotFoundError(`Could not find notifications of user with id ${userId}`);
        }

        res.status(StatusCodes.OK).json(notifications);
    });

export const shareAchievement = (
    notificationsDal: NotificationsDal,
    usersDal: UsersDal
) =>
    shareAchievementValidator(async (req, res) => {
        const { id: fromUserId } = req.user;
        const { toUserIds, relatedEntityId } = req.body;

        const sender = await usersDal.findById(fromUserId).lean();
        if (!sender || !sender.username) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
            return;
        }

        const message = `${sender.username} unlocked a new achievement!`;

        const notifications = toUserIds.map((toUserId: string) => ({
            toUserId,
            fromUserId,
            type: "achievement",
            relatedEntityId,
            entityType: "user",
            message,
            read: false,
            createdAt: new Date(),
        }));

        await notificationsDal.insertMany(notifications as any);
        res.status(StatusCodes.CREATED).send({ message: "Friends notified" });
    });

export const shareLesson = (
    notificationsDal: NotificationsDal,
    usersDal: UsersDal,
) =>
    shareLessonValidator(async (req, res) => {
        const { id: fromUserId } = req.user;
        const { toUserIds, relatedEntityId } = req.body;

        const sender = await usersDal.findById(fromUserId).lean();
        if (!sender || !sender.username) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
            return;
        }

        const message = `${sender.username} shared a lesson with you!`;

        const notification = toUserIds.map((toUserId: string) => ({
            toUserId,
            fromUserId,
            type: "share",
            relatedEntityId,
            entityType: "lesson",
            message,
            read: false,
            createdAt: new Date(),
        }));

        await notificationsDal.insertMany(notification as any);
        res.status(StatusCodes.CREATED).send({ message: "Notifications sent" });
    });

export const markNotificationAsRead = (notificationsDal: NotificationsDal) =>
    markAsReadValidator(async (req, res) => {
        const { id } = req.params;
        await notificationsDal.markAsRead(id);

        res.sendStatus(StatusCodes.OK);
    });


export const deleteNotification = (notificationDal: NotificationsDal) =>
    deleteNotificationValidator(async (req, res) => {
        const { id } = req.params;

        await notificationDal.deleteById(id);

        if (isNil(id)) {
            throw new NotFoundError(`Could not find notification with id ${id}`);
        }

        res.status(StatusCodes.OK).send({ message: `Notification with id ${id} deleted successfully.` });
    });

export const notifyFriendRequest = (
    notificationsDal: NotificationsDal,
    usersDal: UsersDal
) =>
    friendRequestValidator(async (req, res) => {
        const { id: fromUserId } = req.user;
        const { toUserId } = req.body;

        const sender = await usersDal.findById(fromUserId).lean();
        if (!sender || !sender.username) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
            return;
        }

        const message = `${sender.username} sent you a friend request!`;

        const notification = {
            toUserIds: [toUserId], // single recipient as array
            fromUserId,
            type: "friendRequest",
            relatedEntityId: fromUserId,
            entityType: "user",
            message,
            read: false,
            createdAt: new Date(),
        };

        await notificationsDal.create(notification as any);
        res.status(StatusCodes.CREATED).send({ message: "Friend request notification sent" });
    });