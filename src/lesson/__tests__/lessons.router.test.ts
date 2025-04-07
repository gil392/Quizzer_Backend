import { Express } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { dissoc } from 'ramda';
import request from 'supertest';
import { VideoSummeraizer } from '../../externalApis/videoSummerizer';
import { DatabaseConfig } from '../../services/database/config';
import { Database } from '../../services/database/database';
import { createBasicApp } from '../../services/server/server';
import { createTestEnv } from '../../utils/tests';
import { LessonsDal } from '../dal';
import { Lesson } from '../model';
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
    const videoUrlMock = 'http://domain.com';
    const titleMock = 'lesson title';

    const summarizerConfig: SummarizerConfig = { apiKey: '' };
    const videoSummeraizerMock = new VideoSummeraizer(summarizerConfig);
    jest.spyOn(videoSummeraizerMock, 'summerizeVideo').mockResolvedValue(
        summaryMock
    );

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
        const createLessonRequest = () => request(app).post('/');

        test('missing title should return BAD_REQUEST', async () => {
            const response = await createLessonRequest().send({
                videoUrl: videoUrlMock
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('missing videoUrl should return BAD_REQUEST', async () => {
            const response = await createLessonRequest().send({
                title: titleMock
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('videoUrl not url should return BAD_REQUEST', async () => {
            const response = await createLessonRequest().send({
                title: titleMock,
                videoUrl: 'some string'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('valid lesson should create lesson', async () => {
            const lessonToCreate: CreateLessonRequst['body'] = {
                title: 'lesson Title',
                videoUrl: videoUrlMock
            };
            const response = await createLessonRequest().send(lessonToCreate);

            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body).toStrictEqual(
                expect.objectContaining({
                    ...lessonToCreate,
                    summary: summaryMock
                })
            );
        });
    });

    describe('get lesson by id', () => {
        const getLessonByIdRequest = (id: string = '') =>
            request(app).get(`/${id}`);
        const lessonMock: Lesson & { _id: Types.ObjectId } = {
            _id: new Types.ObjectId(),
            owner: 'owner mock',
            sharedUsers: [],
            summary: summaryMock,
            title: titleMock,
            videoUrl: videoUrlMock
        };

        beforeEach(async () => {
            await lessonModel.create(lessonMock);
        });
        afterEach(async () => {
            await lessonModel.deleteMany();
        });

        test('existing lesson id should return lesson', async () => {
            const response = await getLessonByIdRequest(
                lessonMock._id.toString()
            );
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toStrictEqual(
                expect.objectContaining(dissoc('_id', lessonMock))
            );
        });

        test('not existing lesson id should return NOT_FOUND', async () => {
            const response = await getLessonByIdRequest(
                new Types.ObjectId().toString()
            );
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
        });
    });
});
