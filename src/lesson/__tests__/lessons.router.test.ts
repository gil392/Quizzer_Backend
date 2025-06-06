import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { dissoc } from 'ramda';
import request from 'supertest';
import { VideoSummeraizer } from '../../externalApis/videoSummerizer';
import * as youtubeGetVideoDetails from '../../externalApis/youtube/getVideoDetails';
import { DatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { asMockOf, createTestEnv } from '../../utils/tests/utils';
import { LessonsDal } from '../dal';
import { Lesson } from '../model';
import { createLessonRouter } from '../router';
import { CreateLessonRequst } from '../validators';

describe("lessons routes", () => {
  const config = createTestEnv();
  const databaseConfig: DatabaseConfig = {
    connectionString: config.DB_CONNECTION_STRING,
  };
  const database = new Database(databaseConfig);
  const { lessonModel } = database.getModels();
  const lessonsDal = new LessonsDal(lessonModel);
  const authMiddlewareMock = (req: any, res: any, next: any) => {
    req.user = { id: "owner mock" };
    next();
  };
  const summaryMock = "summary mock";
  const videoUrlMock = "https://www.youtube.com/watch?v=xvFZjo5PgG0";
  const videoIdMock = "xvFZjo5PgG0";
  const videoDetailsMock = {
    channel: "channel",
    channelId: "channelId",
    description: "description",
    duration: "10000",
    tags: ["tag1"],
    title: "video title",
    views: "0",
    videoId: videoIdMock,
  };
  const titleMock = "lesson title";

  const videoSummeraizerMock = asMockOf<VideoSummeraizer>({
    summerizeVideo: jest.fn().mockResolvedValue(summaryMock),
  });
  jest.spyOn(youtubeGetVideoDetails, "getVideoDetails").mockResolvedValue({
    channel: "channel",
    description: "description",
    channelId: "channelId",
    duration: "10000",
    title: titleMock,
    views: "0",
  });

  const app: Express = createBasicApp();
  app.use(
    "/",
    createLessonRouter(authMiddlewareMock, {
      lessonsDal,
      videoSummeraizer: videoSummeraizerMock,
    })
  );

  beforeAll(async () => {
    await database.start();
  });
  afterAll(async () => {
    await database.stop();
  });

  afterEach(async () => {
    await lessonModel.deleteMany();
  });

  describe("create lesson", () => {
    const createLessonRequest = () => request(app).post("/");

    test("missing videoUrl should return BAD_REQUEST", async () => {
      const response = await createLessonRequest().send({});
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("videoUrl not url should return BAD_REQUEST", async () => {
      const response = await createLessonRequest().send({
        videoUrl: "some string",
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("valid lesson should create lesson", async () => {
      const lessonToCreate: CreateLessonRequst["body"] = {
        videoUrl: videoUrlMock,
      };
      const response = await createLessonRequest().send(lessonToCreate);
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          summary: summaryMock,
          title: titleMock,
          videoDetails: expect.objectContaining({
            videoId: videoIdMock,
          }),
        })
      );
    });
  });

  describe("create related lesson", () => {
    const createLessonRequest = () => request(app).post("/");

    test("missing relatedLessonGroupId is allowed (regular lesson)", async () => {
      const response = await createLessonRequest().send({
        videoUrl: videoUrlMock,
      });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).not.toHaveProperty("relatedLessonGroupId");
    });

    test("relatedLessonGroupId not a string should return BAD_REQUEST", async () => {
      const response = await createLessonRequest().send({
        videoUrl: videoUrlMock,
        relatedLessonGroupId: 123,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("valid related lesson should create lesson with relatedLessonGroupId", async () => {
      const relatedLessonGroupId = new Types.ObjectId().toString();
      const response = await createLessonRequest().send({
        videoUrl: videoUrlMock,
        relatedLessonGroupId,
      });
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          summary: summaryMock,
          title: titleMock,
          videoDetails: expect.objectContaining({
            videoId: videoIdMock,
          }),
          relatedLessonGroupId,
        })
      );
    });
  });

  describe("get lesson by id", () => {
    const getLessonByIdRequest = (id: string = "") =>
      request(app).get(`/${id}`);
    const lessonMock: Lesson & { _id: Types.ObjectId } = {
      _id: new Types.ObjectId(),
      owner: "owner mock",
      sharedUsers: [],
      summary: summaryMock,
      title: titleMock,
      videoDetails: videoDetailsMock,
    };

    beforeEach(async () => {
      await lessonModel.create(lessonMock);
    });
    afterEach(async () => {
      await lessonModel.deleteMany();
    });

    test("existing lesson id should return lesson", async () => {
      const response = await getLessonByIdRequest(lessonMock._id.toString());
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toStrictEqual(
        expect.objectContaining(dissoc("_id", lessonMock))
      );
    });

    test("not existing lesson id should return NOT_FOUND", async () => {
      const response = await getLessonByIdRequest(
        new Types.ObjectId().toString()
      );
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });
  });
});
