import { StatusCodes } from "http-status-codes";
import { NotificationsDal } from "./dal";
import { UsersDal } from "../user/dal";
import {
    getNotificationsValidatorByUserId,
    markAsReadValidator,
    deleteNotificationValidator,
    notifyFriendsAboutAchievementValidator,
    shareQuizOrSummaryValidator,
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

export const notifyFriendsAboutAchievement = (
    notificationsDal: NotificationsDal,
    usersDal: UsersDal
) =>
    notifyFriendsAboutAchievementValidator(async (req, res) => {
        const { id: userId } = req.user;
        const { relatedEntityId, entityType } = req.body;

        const user = await usersDal.findById(userId).lean();
        if (!user || !user.friends) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "User or friends not found" });
            return;
        }

        const message = `${user.username} unlocked a new achievement!`;

        const notifications = user.friends.map((friendId: string) => ({
            toUserId: friendId,
            fromUserId: userId,
            type: "achievement",
            relatedEntityId,
            entityType,
            message,
            read: false,
            createdAt: new Date(),
        }));

        await notificationsDal.insertMany(notifications as any);
        res.status(StatusCodes.CREATED).send({ message: "Friends notified" });
    });

export const shareQuizOrSummary = (
    notificationsDal: NotificationsDal,
    usersDal: UsersDal,
) =>
    shareQuizOrSummaryValidator(async (req, res) => {
        const { id: fromUserId } = req.user;
        const { toUserIds, entityType, relatedEntityId } = req.body;

        const sender = await usersDal.findById(fromUserId).lean();
        if (!sender || !sender.username) {
            res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
            return;
        }

        const message = `${sender.username} shared a ${entityType} with you!`;

        const notifications = toUserIds.map((toUserId: string) => ({
            toUserId,
            fromUserId,
            type: "share",
            relatedEntityId,
            entityType,
            message,
            read: false,
            createdAt: new Date(),
        }));

        await notificationsDal.insertMany(notifications as any);
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
            toUserId,
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