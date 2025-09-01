import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import request from "supertest";
import { AchievementsDal } from "../../achivments/dal";
import { achievementModel } from "../../achivments/model";
import { LessonsDal } from "../../lesson/dal";
import { lessonModel } from "../../lesson/model";
import { lessonMock } from "../../quiz/__tests__/mocks";
import { DatabaseConfig } from "../../services/database/config";
import { Database } from "../../services/database/database";
import { createBasicApp } from "../../services/server/server";
import { UsersDal } from "../../user/dal";
import { userModel } from "../../user/model";
import { createTestEnv } from "../../utils/tests/utils";
import { NotificationsDal } from "../dal";
import { notificationModel } from "../model";
import { createNotificationRouter } from "../router";
import { Achievement } from "../../achivments/types";
import { userAchievementsMock } from "../../achivments/__tests__/user.achievements.mock";
import { lessonAchievementsMock } from "../../achivments/__tests__/lesson.achievements.mock";

describe("notifications routes", () => {
  const config = createTestEnv();
  const databaseConfig: DatabaseConfig = {
    connectionString: config.DB_CONNECTION_STRING,
  };
  const database = new Database(databaseConfig);
  const notificationDal = new NotificationsDal(notificationModel);
  const usersDal = new UsersDal(userModel);
  const lessonsDal = new LessonsDal(lessonModel);
  const achievementsDal = new AchievementsDal(achievementModel);
  const achievementsMock: Achievement[] = [
    ...userAchievementsMock,
    ...lessonAchievementsMock,
  ];

  const userId = new Types.ObjectId();
  const user2Id = new Types.ObjectId();
  const user3Id = new Types.ObjectId();

  const sharedLessonMock = {
    ...lessonMock,
    sharedUsers: [user2Id.toString(), user3Id.toString()],
  };

  const authMiddlewareMock = (req: any, res: any, next: any) => {
    req.user = { id: userId.toString() };
    next();
  };

  const app: Express = createBasicApp();
  app.use(
    "/notifications",
    createNotificationRouter(authMiddlewareMock, {
      notificationDal,
      usersDal,
      lessonsDal,
      achievementsDal,
    })
  );

  beforeAll(async () => {
    await database.start();
    await userModel.deleteMany();
    await notificationModel.deleteMany();
    await lessonModel.deleteMany();
    await achievementModel.deleteMany();

    await userModel.create({
      _id: userId,
      username: "Alice",
      friends: [user2Id, user3Id],
      email: "alice@example.com",
      hashedPassword: "testhash",
    });
    await userModel.create({
      _id: user2Id,
      username: "Bob",
      friends: [],
      email: "bob@example.com",
      hashedPassword: "testhash",
    });
    await userModel.create({
      _id: user3Id,
      username: "Charlie",
      friends: [],
      email: "charlie@example.com",
      hashedPassword: "testhash",
    });

    await lessonModel.create(sharedLessonMock);
    await achievementModel.insertMany(achievementsMock);
  });
  afterAll(async () => {
    await database.stop();
  });

  afterEach(async () => {
    await notificationModel.deleteMany();
  });

  describe("GET /notifications", () => {
    test("should return empty array if no notifications", async () => {
      const response = await request(app).get("/notifications");
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toEqual([]);
    });

    test("should return notifications for the authenticated user", async () => {
      await notificationModel.create({
        toUserId: userId.toString(),
        fromUserId: user2Id.toString(),
        type: "share",
        relatedEntityId: new Types.ObjectId().toString(),
        entityType: "lesson",
        message: "A lesson was shared with you!",
        read: false,
        createdAt: new Date(),
      });
      const response = await request(app).get("/notifications");
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject({
        toUserId: userId.toString(),
        fromUserId: user2Id.toString(),
        type: "share",
        entityType: "lesson",
        message: "A lesson was shared with you!",
        read: false,
      });
    });
  });

  describe("PUT /notifications/:id/read", () => {
    test("should mark notification as read", async () => {
      const notif = await notificationModel.create({
        toUserId: userId.toString(),
        fromUserId: user2Id.toString(),
        type: "achievement",
        relatedEntityId: new Types.ObjectId().toString(),
        entityType: "user",
        message: "You got an achievement!",
        read: false,
        createdAt: new Date(),
      });
      const response = await request(app).put(
        `/notifications/${notif._id}/read`
      );
      expect(response.status).toBe(StatusCodes.OK);

      const updated = await notificationModel.findById(notif._id);
      expect(updated?.read).toBe(true);
    });
  });

  describe("DELETE /notifications/:id", () => {
    test("should delete notification", async () => {
      const notif = await notificationModel.create({
        toUserId: userId.toString(),
        fromUserId: user2Id.toString(),
        type: "share",
        relatedEntityId: new Types.ObjectId().toString(),
        entityType: "lesson",
        message: "A lesson was shared with you!",
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

  describe("POST /notifications/share-lesson", () => {
    test("should create share notifications for specified users", async () => {
      const relatedEntityId = sharedLessonMock._id;
      const response = await request(app)
        .post("/notifications/share-lesson")
        .send({
          toUserIds: [user2Id.toString(), user3Id.toString()],
          relatedEntityId,
        });
      expect(response.status).toBe(StatusCodes.CREATED);
      //   expect(response.body.message).toEqual({ message: "Notifications sent" });
      expect(response.body._id.toString()).toEqual(
        sharedLessonMock._id.toString()
      );

      const notifs = await notificationModel.find({ type: "share" });
      expect(notifs.length).toBe(2);
      expect(notifs.map((n) => n.toUserId)).toEqual(
        expect.arrayContaining([user2Id.toString(), user3Id.toString()])
      );
      expect(notifs[0].entityType).toBe("lesson");
      expect(notifs[0].relatedEntityId).toBe(relatedEntityId.toString());
    });
  });

  describe("POST /notifications/share-achievement", () => {
    test("should notify all friends about an achievement", async () => {
      const relatedEntityId = achievementsMock[0]._id;
      const response = await request(app)
        .post("/notifications/share-achievement")
        .send({
          toUserIds: [user2Id.toString(), user3Id.toString()],
          relatedEntityId,
        });
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toEqual({ message: "Friends notified" });

      const notifs = await notificationModel.find({ type: "achievement" });
      expect(notifs.length).toBe(2);
      expect(notifs.map((n) => n.toUserId)).toEqual(
        expect.arrayContaining([user2Id.toString(), user3Id.toString()])
      );
      expect(notifs[0].entityType).toBe("user");
      expect(notifs[0].relatedEntityId).toBe(relatedEntityId.toString());
      expect(notifs[0].message).toContain("achievement");
    });
  });

  describe("POST /notifications/friend-request", () => {
    test("should notify a user about a friend request", async () => {
      const response = await request(app)
        .post("/notifications/friend-request")
        .send({
          toUserId: user2Id.toString(),
        });
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toEqual({
        message: "Friend request notification sent",
      });

      const notif = await notificationModel.findOne({
        type: "friendRequest",
        toUserId: user2Id.toString(),
      });
      expect(notif).toBeTruthy();
      expect(notif?.entityType).toBe("user");
      expect(notif?.fromUserId).toBe(userId.toString());
      expect(notif?.message).toContain("sent you a friend request");
    });
  });
});
