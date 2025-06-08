import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import request from "supertest";
import { createTestEnv } from '../../utils/tests/utils';
import { DatabaseConfig } from "../../services/database/config";
import { Database } from "../../services/database/database";
import { createBasicApp } from "../../services/server/server";
import { NotificationsDal } from "../dal";
import { notificationModel } from "../model";
import { createNotificationRouter } from "../router";
import { UsersDal } from "../../user/dal";
import { userModel } from "../../user/model";

describe("notifications routes", () => {
    const config = createTestEnv();
    const databaseConfig: DatabaseConfig = {
        connectionString: config.DB_CONNECTION_STRING,
    };
    const database = new Database(databaseConfig);
    const notificationDal = new NotificationsDal(notificationModel);
    const usersDal = new UsersDal(userModel);

    const authMiddlewareMock = (req: any, res: any, next: any) => {
        req.user = { id: "user123" };
        next();
    };

    const app: Express = createBasicApp();
    app.use(
        "/notifications",
        createNotificationRouter(authMiddlewareMock, {
            notificationDal,
            usersDal,
        })
    );

    beforeAll(async () => {
        await database.start();
        await userModel.deleteMany();
        // Create a user with friends for achievement notification test
        await userModel.create({
            _id: "user123",
            username: "Alice",
            friends: ["user456", "user789"],
        });
        await userModel.create({
            _id: "user456",
            username: "Bob",
            friends: [],
        });
        await userModel.create({
            _id: "user789",
            username: "Charlie",
            friends: [],
        });
    });
    afterAll(async () => {
        await database.stop();
    });

    afterEach(async () => {
        await notificationModel.deleteMany();
    });

    describe("get notifications for authenticated user", () => {
        test("should return empty array if no notifications", async () => {
            const response = await request(app).get("/notifications");
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual([]);
        });

        test("should return notifications for the authenticated user", async () => {
            const notif = await notificationModel.create({
                toUserId: "user123",
                fromUserId: "user456",
                type: "share",
                relatedEntityId: "quiz789",
                entityType: "quiz",
                message: "A quiz was shared with you!",
                read: false,
                createdAt: new Date(),
            });
            const response = await request(app).get("/notifications");
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        _id: notif._id.toString(),
                        toUserId: "user123",
                        fromUserId: "user456",
                        type: "share",
                        relatedEntityId: "quiz789",
                        entityType: "quiz",
                        message: "A quiz was shared with you!",
                        read: false,
                    }),
                ])
            );
        });
    });

    describe("mark notification as read", () => {
        test("should mark notification as read", async () => {
            const notif = await notificationModel.create({
                toUserId: "user123",
                fromUserId: "user456",
                type: "achievement",
                relatedEntityId: "achv1",
                entityType: "user",
                message: "You got an achievement!",
                read: false,
                createdAt: new Date(),
            });
            const response = await request(app).put(`/notifications/${notif._id}/read`);
            expect(response.status).toBe(StatusCodes.OK);

            const updated = await notificationModel.findById(notif._id);
            expect(updated?.read).toBe(true);
        });
    });

    describe("delete notification", () => {
        test("should delete notification", async () => {
            const notif = await notificationModel.create({
                toUserId: "user123",
                fromUserId: "user456",
                type: "share",
                relatedEntityId: "quiz789",
                entityType: "quiz",
                message: "A quiz was shared with you!",
                read: false,
                createdAt: new Date(),
            });
            const response = await request(app).delete(`/notifications/${notif._id}`);
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toEqual({
                message: `Notification with id ${notif._id} deleted successfully.`,
            });

            const deleted = await notificationModel.findById(notif._id);
            expect(deleted).toBeNull();
        });
    });

    describe("POST /notifications/share", () => {
        test("should create share notifications for specified users", async () => {
            const response = await request(app)
                .post("/notifications/share")
                .send({
                    toUserIds: ["user456", "user789"],
                    entityType: "quiz",
                    relatedEntityId: "quiz123"
                });
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({ message: "Notifications sent" });

            const notifs = await notificationModel.find({ type: "share" });
            expect(notifs.length).toBe(2);
            expect(notifs.map(n => n.toUserId)).toEqual(expect.arrayContaining(["user456", "user789"]));
            expect(notifs[0].entityType).toBe("quiz");
            expect(notifs[0].relatedEntityId).toBe("quiz123");
        });
    });

    describe("POST /notifications/notify-friends-achievement", () => {
        test("should notify all friends about an achievement", async () => {
            const response = await request(app)
                .post("/notifications/notify-friends-achievement")
                .send({
                    relatedEntityId: "quiz123",
                    entityType: "quiz",
                    score: 95
                });
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({ message: "Friends notified" });

            const notifs = await notificationModel.find({ type: "achievement" });
            expect(notifs.length).toBe(2);
            expect(notifs.map(n => n.toUserId)).toEqual(expect.arrayContaining(["user456", "user789"]));
            expect(notifs[0].entityType).toBe("quiz");
            expect(notifs[0].relatedEntityId).toBe("quiz123");
            expect(notifs[0].message).toContain("Alice completed a quiz and scored 95%");
        });
    });
});