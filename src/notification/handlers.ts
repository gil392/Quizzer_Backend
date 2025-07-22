import { StatusCodes } from "http-status-codes";
import { NotificationsDal } from "./dal";
import { UsersDal } from "../user/dal";
import {
  getNotificationsValidatorByUserId,
  markAsReadValidator,
  deleteNotificationValidator,
  shareAchievementValidator,
  shareLessonValidator,
  friendRequestValidator,
} from "./validators";
import { isNil } from "ramda";
import { NotFoundError } from "../services/server/exceptions";
import { Lesson } from "../lesson/model";
import { LessonsDal } from "../lesson/dal";
import { AchievementsDal } from "../achivments/dal";

export const getNotificationsByUserId = (notificationsDal: NotificationsDal) =>
  getNotificationsValidatorByUserId(async (req, res) => {
    const { id: userId } = req.user;

    const notifications = await notificationsDal.findNotificationsByUserId(
      userId
    );

    if (isNil(notifications)) {
      throw new NotFoundError(
        `Could not find notifications of user with id ${userId}`
      );
    }

    res.status(StatusCodes.OK).json(notifications);
  });

export const shareAchievement = (
  notificationsDal: NotificationsDal,
  usersDal: UsersDal,
  achievementsDal: AchievementsDal
) =>
  shareAchievementValidator(async (req, res) => {
    const { id: fromUserId } = req.user;
    const { toUserIds, relatedEntityId } = req.body;

    const sender = await usersDal.findById(fromUserId).lean();
    if (!sender || !sender.username) {
      res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
      return;
    }

    const achievement = await achievementsDal.findById(relatedEntityId);
    if (!achievement) {
      res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: "Achievement not found" });
      return;
    }
    const updatedAchievement = await achievementsDal.updateById(
      relatedEntityId,
      {
        sharedUsers: Array.from(
          new Set([...achievement.sharedUsers, ...toUserIds])
        ),
      }
    );

    if (isNil(updatedAchievement)) {
      throw new NotFoundError(
        `Could not find achievement with id ${relatedEntityId}`
      );
    }

    const message = `${sender.username} shared an achievement with you!`;

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
  lessonsDal: LessonsDal
) =>
  shareLessonValidator(async (req, res) => {
    const { id: fromUserId } = req.user;
    const { toUserIds, relatedEntityId } = req.body;

    const sender = await usersDal.findById(fromUserId).lean();
    if (!sender || !sender.username) {
      res.status(StatusCodes.NOT_FOUND).send({ message: "Sender not found" });
      return;
    }

    const lesson: Lesson | null = await lessonsDal.findById(relatedEntityId);
    if (!lesson) {
      res.status(StatusCodes.NOT_FOUND).send({ message: "Lesson not found" });
      return;
    }

    const updatedLesson = await lessonsDal.updateById(relatedEntityId, {
      sharedUsers: Array.from(new Set([...lesson.sharedUsers, ...toUserIds])),
    });

    if (isNil(updatedLesson)) {
      throw new NotFoundError(
        `Could not find lesson with id ${relatedEntityId}`
      );
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
    res.status(StatusCodes.CREATED).json({ ...updatedLesson.toObject() });
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

    res
      .status(StatusCodes.OK)
      .send({ message: `Notification with id ${id} deleted successfully.` });
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

    try {
      const notification = {
        toUserId: toUserId,
        fromUserId,
        type: "friendRequest",
        relatedEntityId: fromUserId,
        entityType: "user",
        message,
        read: false,
        createdAt: new Date(),
      };

      await notificationsDal.create(notification as any);
      res
        .status(StatusCodes.CREATED)
        .send({ message: "Friend request notification sent" });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({ message: "Failed to send friend request notification" });
    }
  });
