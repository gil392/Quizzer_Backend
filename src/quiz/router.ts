import { Router } from 'express';
import { LessonsDal } from '../lesson/dal';
import { QuizzesDal } from './dal';
import * as handlers from './handlers';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { VideoSummeraizer } from '../externalApis/videoSummerizer';

export type QuizRouterDependencies = {
    quizzesDal: QuizzesDal;
    lessonsDal: LessonsDal;
    questionsGenerator: QuestionsGenerator;
    videoSummeraizer: VideoSummeraizer;
};

const createRouterController = ({
    quizzesDal,
    lessonsDal,
    questionsGenerator,
    videoSummeraizer
}: QuizRouterDependencies) => ({
    generateQuiz: handlers.generateQuiz(
        quizzesDal,
        lessonsDal,
        questionsGenerator,
        videoSummeraizer
    )
});

export const createQuizRouter = (
    dependecies: QuizRouterDependencies
): Router => {
    const router = Router();
    const controller = createRouterController(dependecies);

    router.post('/', controller.generateQuiz);

    return router;
};
