import { notificationModel } from "./model";
import { Notification } from "./types";
import { BasicDal } from "../services/database/base.dal";

export class NotificationsDal extends BasicDal<Notification> {
    static async findNotificationsByUserId(userId: string) {
        return notificationModel.find({ toUserId: userId }).sort({ createdAt: -1 });
    }
}