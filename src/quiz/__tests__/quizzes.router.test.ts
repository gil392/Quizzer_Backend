import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import request from "supertest";
import { QuestionsGenerator } from "../../externalApis/quizGenerator";
import { LessonsDal } from "../../lesson/dal";
import { DatabaseConfig } from "../../services/database/config";
import { Database } from "../../services/database/database";
import { createBasicApp } from "../../services/server/server";
import { asMockOf, createTestEnv } from "../../utils/tests";
import { QuizzesDal } from "../dal";
import { createQuizRouter } from "../router";
import { createQuizResponseQuestion } from "../utils";
import {
  generatedQuestionsMock,
  lessonMock,
  questionAnswerSubmittionsMock,
  questionAnswerSubmittionsMockResults,
  questionAnswerSubmittionsMockScore,
  quizMock,
  quizSettings,
} from "./mocks";
import { QuizzesRatingDal } from "../../quizRating/dal";
import { quizRatingModel } from "../../quizRating/model";

describe("quizzes routes", () => {
  const config = createTestEnv();
  const databaseConfig: DatabaseConfig = {
    connectionString: config.DB_CONNECTION_STRING,
  };
  const database = new Database(databaseConfig);
  const authMiddlewareMock = (req: any, res: any, next: any) => next();
  const { quizModel, lessonModel } = database.getModels();
  const quizzesDal = new QuizzesDal(quizModel);
  const lessonsDal = new LessonsDal(lessonModel);
  const quizzesRatingDal = new QuizzesRatingDal(quizRatingModel);
  const questionsGenerator = asMockOf<QuestionsGenerator>({
    generateQuestionsFromLessonSummary: jest
      .fn()
      .mockResolvedValue(generatedQuestionsMock),
    generateQuestions: jest.fn(),
  });

  const app: Express = createBasicApp();
  app.use(
    "/",
    createQuizRouter(authMiddlewareMock, {
      quizzesDal,
      lessonsDal,
      quizzesRatingDal,
      questionsGenerator,
    })
  );

  beforeAll(async () => {
    await database.start();
  });
  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await lessonModel.create(lessonMock);
  });
  afterEach(async () => {
    await quizModel.deleteMany();
    await lessonModel.deleteMany();
  });

  describe("generate quiz", () => {
    const generatePostRequst = () => request(app).post("/");
    test("missing lessonId should return BAD_REQUEST", async () => {
      const response = await generatePostRequst().send({
        settings: quizSettings,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("generate for not existing lesson should return BAD_REQUEST", async () => {
      const response = await generatePostRequst().send({
        lessonId: new Types.ObjectId(),
        settings: quizSettings,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("missing settings should return BAD_REQUEST", async () => {
      const response = await generatePostRequst().send({
        lessonId: lessonMock._id,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("valid quiz should generate quiz", async () => {
      const settings = quizSettings;
      const lessonId = lessonMock._id.toString();

      const response = await generatePostRequst().send({
        lessonId,
        settings,
      });

      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toStrictEqual(
        expect.objectContaining({
          lessonId,
          settings,
          questions: generatedQuestionsMock.map(createQuizResponseQuestion),
        })
      );

      const { _id: quizId } = response.body;
      const quiz = await quizModel.findById(quizId);
      expect(quiz).toBeDefined();
    });
  });

  describe("submit quiz", () => {
    const submitPostRequst = () => request(app).post("/submit");

    beforeEach(async () => {
      await quizModel.create(quizMock);
    });
    afterEach(async () => {
      await quizModel.deleteMany();
    });

    test("missing quizId should return BAD_REQUEST", async () => {
      const response = await submitPostRequst().send({
        questions: questionAnswerSubmittionsMock,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("submit for not existing quiz should return BAD_REQUEST", async () => {
      const response = await submitPostRequst().send({
        quizId: new Types.ObjectId(),
        questions: questionAnswerSubmittionsMock,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("empty questions submit should return BAD_REQUEST", async () => {
      const response = await submitPostRequst().send({
        quizId: quizMock._id,
        questions: [],
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("missing questions should return BAD_REQUEST", async () => {
      const response = await submitPostRequst().send({
        quizId: quizMock._id,
      });
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    test("submit quiz should return quiz result", async () => {
      const response = await submitPostRequst().send({
        quizId: quizMock._id,
        questions: questionAnswerSubmittionsMock,
      });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toStrictEqual({
        quizId: quizMock._id,
        results: questionAnswerSubmittionsMockResults,
        score: questionAnswerSubmittionsMockScore,
      });
    });
  });
});
