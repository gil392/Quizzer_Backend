import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { VideoSummeraizer } from '../../externalApis/videoSummerizer';
import { DatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { createTestEnv } from '../../utils/tests';
import { LessonsDal } from '../dal';
import { createLessonRouter } from '../router';
import { CreateLessonRequst } from '../validators';
import { SummarizerConfig } from '../../externalApis/transcriptSummarizer/config';


describe('lessons routes', () => {
    const config = createTestEnv();
    const databaseConfig: DatabaseConfig = {
        connectionString: config.DB_CONNECTION_STRING
    };
    const database = new Database(databaseConfig);
    const { lessonModel } = database.getModels();
    const lessonsDal = new LessonsDal(lessonModel);
    const summaryMock = 'summary mock';

    const summarizerConfig: SummarizerConfig = { apiKey: '' };
    const videoSummeraizerMock = new VideoSummeraizer(summarizerConfig);

    jest.spyOn(videoSummeraizerMock, 'summerizeVideo').mockResolvedValue(
        summaryMock
    );

    // const videoSummeraizerMock: Record<keyof VideoSummeraizer, jest.Mock> = {
    //     summerizeVideo: jest.fn().mockResolvedValue(summaryMock)
    // };

    const app: Express = createBasicApp();
    app.use(
        '/',
        createLessonRouter({
            lessonsDal,
            videoSummeraizer: videoSummeraizerMock
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

    describe('create lesson', () => {
        test('missing title should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                videoUrl: 'http://domain.com'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing videoUrl should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                title: 'title'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('videoUrl not url should return BAD_REQUEST', async () => {
            const response = await request(app).post('/').send({
                title: 'title',
                videoUrl: 'some string'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('valid lesson should create lesson', async () => {
            const lessonToCreate: CreateLessonRequst['body'] = {
                title: 'lesson Title',
                videoUrl: 'http://domain.com'
            };
            const response = await request(app).post('/').send(lessonToCreate);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining({
                    ...lessonToCreate,
                    summary: summaryMock
                })
            );
        });
    });
});
