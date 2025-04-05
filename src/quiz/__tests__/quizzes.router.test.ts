import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import request from 'supertest';
import { QuestionsGenerator } from '../../externalApis/quizGenerator';
import { LessonsDal } from '../../lesson/dal';
import { DatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { createTestEnv } from '../../utils/tests';
import { QuizzesDal } from '../dal';
import { createQuizRouter } from '../router';
import { generatedQuestionsMock, lessonMock, quizSettings } from './mocks';

describe('quizzes routes', () => {
    const config = createTestEnv();
    const databaseConfig: DatabaseConfig = {
        connectionString: config.DB_CONNECTION_STRING
    };
    const database = new Database(databaseConfig);
    const { quizModel, lessonModel } = database.getModels();
    const quizzesDal = new QuizzesDal(quizModel);
    const lessonsDal = new LessonsDal(lessonModel);
    const questionsGenerator: Record<keyof QuestionsGenerator, jest.Mock> = {
        generateQuestionsFromLessonSummary: jest
            .fn()
            .mockResolvedValue(generatedQuestionsMock)
    };

    const app: Express = createBasicApp();
    app.use(
        '/',
        createQuizRouter({
            quizzesDal,
            lessonsDal,
            questionsGenerator
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

    describe('generate quiz', () => {
        test('missing lessonId should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                settings: quizSettings
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('generate for not existing lesson should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                lessonId: new Types.ObjectId(),
                settings: quizSettings
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing settings should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                lessonId: lessonMock._id
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('valid quiz should generate quiz', async () => {
            const settings = quizSettings;
            const lessonId = lessonMock._id.toString();

            const response = await request(app)
                .post('/')
                .send({ lessonId, settings });

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining({
                    lessonId,
                    settings,
                    questions: generatedQuestionsMock
                })
            );

            const { _id: quizId } = response.body;
            const quiz = await quizModel.findById(quizId);
            expect(quiz).toBeDefined();
        });
    });
});
