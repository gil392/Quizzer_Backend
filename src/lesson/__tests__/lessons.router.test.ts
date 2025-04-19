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
import { asMockOf, createTestEnv } from '../../utils/tests';
import { LessonsDal } from '../dal';
import { Lesson } from '../model';
import { createLessonRouter } from '../router';
import { CreateLessonRequst } from '../validators';

describe('lessons routes', () => {
    const config = createTestEnv();
    const databaseConfig: DatabaseConfig = {
        connectionString: config.DB_CONNECTION_STRING
    };
    const database = new Database(databaseConfig);
    const { lessonModel } = database.getModels();
    const lessonsDal = new LessonsDal(lessonModel);
    const summaryMock = 'summary mock';
    const videoUrlMock = 'https://www.youtube.com/watch?v=d56mG7DezGs';
    const titleMock = 'lesson title';

    const videoSummeraizerMock = asMockOf<VideoSummeraizer>({
        summerizeVideo: jest.fn().mockResolvedValue(summaryMock)
    });
    jest.spyOn(youtubeGetVideoDetails, 'getVideoDetails').mockResolvedValue({
        channel: 'channel',
        duration: '10000',
        title: 'video title',
        views: '0'
    });

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

        test('missing videoUrl should return BAD_REQUEST', async () => {
            const response = await createLessonRequest().send({});
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('videoUrl not url should return BAD_REQUEST', async () => {
            const response = await createLessonRequest().send({
                videoUrl: 'some string'
            });
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        });

        test('valid lesson should create lesson', async () => {
            const lessonToCreate: CreateLessonRequst['body'] = {
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
