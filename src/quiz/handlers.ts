import { StatusCodes } from 'http-status-codes';
import { QuestionsGenerator } from '../externalApis/quizGenerator';
import { VideoSummeraizer } from '../externalApis/videoSummerizer';
import { LessonsDal } from '../lesson/dal';
import { pocUser } from '../poc.consts';
import { QuizzesDal } from './dal';
import { generateQuizRequstvalidator } from './validators';

export const generateQuiz = (
    quizzesDal: QuizzesDal,
    lessonsDal: LessonsDal,
    questionsGenerator: QuestionsGenerator,
    videoSummeraizer: VideoSummeraizer
) =>
    generateQuizRequstvalidator(async (req, res) => {
        const {
            body: { videoUrl, title, settings: quizSettings }
        } = req;
        const videoSummarize = await videoSummeraizer.summerizeVideo(videoUrl);
        const lesson = await lessonsDal.create({
            owner: pocUser.id,
            sharedUsers: [],
            summary: videoSummarize,
            videoUrl
        });
        const questions =
            await questionsGenerator.generateQuestionsFromLessonSummary(
                videoSummarize
            );

        const quiz = await quizzesDal.create({
            title,
            lessonId: lesson._id.toString(),
            questions,
            settings: quizSettings
        });
        res.status(StatusCodes.CREATED).send(quiz);
    });
