import { StatusCodes } from "http-status-codes";
import { NotificationsDal } from "./dal";
import { getNotificationsValidator, markAsReadValidator, deleteNotificationValidator } from "./validators";
import { isNil } from "ramda";
import { NotFoundError } from "../services/server/exceptions";

export const getNotifications = (notificationsDal: NotificationsDal) =>
    getNotificationsValidator(async (req, res) => {
        const { id } = req.user;

        const notifications = await notificationsDal.findNotificationsByUserId(id);

        if (isNil(notifications)) {
            throw new NotFoundError(`Could not find lesson with id ${id}`);
        }

        res.status(StatusCodes.OK).json(notifications);
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