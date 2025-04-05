import { StatusCodes } from 'http-status-codes';
import { isNil } from 'ramda';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { LessonsDal } from '../lesson/dal';
import { BadRequestError } from '../services/server/exceptions';
import { QuizzesDal } from './dal';
import { generateQuizRequstValidator } from './validators';
import { createFrontQuiz } from './utils';

export const generateQuiz = (
    quizzesDal: QuizzesDal,
    lessonsDal: LessonsDal,
    questionsGenerator: QuestionsGenerator
) =>
    generateQuizRequstValidator(async (req, res) => {
        const {
            body: { lessonId, settings: quizSettings }
        } = req;
        const lesson = await lessonsDal.getById(lessonId).lean();
        if (isNil(lesson)) {
            throw new BadRequestError(`lessonn ${lessonId} is not exist`);
        }

        const questions =
            await questionsGenerator.generateQuestionsFromLessonSummary(
                lesson.summary
            );

        const quiz = await quizzesDal.create({
            title: lesson.title,
            lessonId,
            questions,
            settings: quizSettings
        });
        res.status(StatusCodes.CREATED).send(createFrontQuiz(quiz));
    });
