import { StatusCodes } from 'http-status-codes';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { VideoSummeraizer } from '../externalApis/videoSummerizer';
import { LessonsDal } from '../lesson/dal';
import { pocUser } from '../poc.consts';
import { QuizzesDal } from './dal';
import { generateQuizRequstValidator } from './validators';
import { isNil } from 'ramda';
import { BadRequestError } from '../services/server/exceptions';

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
        res.status(StatusCodes.CREATED).send(quiz);
    });
