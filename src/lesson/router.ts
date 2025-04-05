import { Router } from 'express';
import { VideoSummeraizer } from '../externalApis/videoSummerizer';
import { LessonsDal } from '../lesson/dal';
import * as handlers from './handlers';

export type LessonRouterDependencies = {
    lessonsDal: LessonsDal;
    videoSummeraizer: VideoSummeraizer;
};

const createRouterController = ({
    lessonsDal,
    videoSummeraizer
}: LessonRouterDependencies) => ({
    createLesson: handlers.createLesson(lessonsDal, videoSummeraizer),
    getLessonById: handlers.getLessonById(lessonsDal)
});

export const createLessonRouter = (
    dependecies: LessonRouterDependencies
): Router => {
    const router = Router();
    const controller = createRouterController(dependecies);

    router.get('/:id', controller.getLessonById);
    router.post('/', controller.createLesson);

    return router;
};
