export type NotificationType = "share" | "achievement" | "friendRequest";
export type NotificationEntityType = "quiz" | "summary" | "user";

export interface Notification extends Document {
    toUserId: string;
    fromUserId: string;
    type: NotificationType;
    relatedEntityId: string;
    entityType: NotificationEntityType;
    message: string;
    read: boolean;
    createdAt: Date;
}
