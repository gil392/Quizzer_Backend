import { Router } from 'express';
import { LessonsDal } from '../lesson/dal';
import { QuizzesDal } from './dal';
import * as handlers from './handlers';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { Summarizer } from '../externalApis/transcriptSummarizer/transcriptSummarizer';

export type QuizRouterDependencies = {
    quizzesDal: QuizzesDal;
    lessonsDal: LessonsDal;
    questionsGenerator: QuestionsGenerator;
    transcriptSummarizer: Summarizer;
};

const createRouterController = ({
    quizzesDal,
    lessonsDal,
    questionsGenerator,
    transcriptSummarizer
}: QuizRouterDependencies) => ({
    generateQuiz: handlers.generateQuiz(
        quizzesDal,
        lessonsDal,
        questionsGenerator,
        transcriptSummarizer
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
