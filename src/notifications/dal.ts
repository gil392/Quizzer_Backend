import { notificationModel } from "./model";
import { Notification } from "./types";
import { BasicDal } from "../services/database/base.dal";

export class NotificationsDal extends BasicDal<Notification> {
    async findNotificationsByUserId(userId: string) {
        return notificationModel.find({ toUserId: userId }).sort({ createdAt: -1 });
    }

    async markAsRead(notificationId: string) {
        return notificationModel.updateOne({ _id: notificationId }, { read: true });
    }
}