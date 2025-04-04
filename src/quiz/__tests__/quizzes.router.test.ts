import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { QuestionsGenerator } from '../../externalApis/quizGenerator';
import { VideoSummeraizer } from '../../externalApis/videoSummerizer';
import { LessonsDal } from '../../lesson/dal';
import { DatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { createTestEnv } from '../../utils/tests';
import { QuizzesDal } from '../dal';
import { createQuizRouter } from '../router';
import { generatedQuestionsMock, quizSettings } from './mocks';

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
    const summary = 'summary mock';
    const videoSummeraizer: Record<keyof VideoSummeraizer, jest.Mock> = {
        summerizeVideo: jest.fn().mockResolvedValue(summary)
    };

    const app: Express = createBasicApp();
    app.use(
        '/',
        createQuizRouter({
            quizzesDal,
            lessonsDal,
            questionsGenerator,
            videoSummeraizer
        })
    );

    beforeAll(async () => {
        await database.start();
    });
    afterAll(async () => {
        await database.stop();
    });

    afterEach(async () => {
        await quizModel.deleteMany();
        await lessonModel.deleteMany();
    });

    describe('generate quiz', () => {
        test('missing title should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                videoUrl: 'http://domain.com',
                settings: quizSettings
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing videoUrl should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                title: 'title',
                settings: quizSettings
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('videoUrl not url title should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                title: 'title',
                videoUrl: 'some string',
                settings: quizSettings
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing settings should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                title: 'title',
                videoUrl: 'http://domain.com'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('valid quiz should generate quiz and lesson', async () => {
            const title = 'title';
            const videoUrl = 'http://domain.com';
            const settings = quizSettings;
            const response = await request(app)
                .post('/')
                .send({ title, videoUrl, settings });

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining({
                    title,
                    settings,
                    questions: generatedQuestionsMock
                })
            );

            const { _id: quizId, lessonId } = response.body;
            const quiz = await quizModel.findById(quizId);
            expect(quiz).toBeDefined();

            const lesson = await lessonModel.findById(lessonId);
            expect(lesson).toBeDefined();
            expect(lesson).toStrictEqual(
                expect.objectContaining({ videoUrl, summary })
            );
        });
    });
});
