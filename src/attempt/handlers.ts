import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { BadRequestError } from "../services/server/exceptions";
import { AttemptDal } from "./dal";
import {
    getAttemptsByQuizIdRequestValidator,
    createAttemptRequstZodSchema,

} from "./validators";
import { getQuestionResultInQuiz } from "./utils";
import { QuizzesDal } from "../quiz/dal";
import { QuestionResult } from "../quiz/types";
import { QuizAttempt } from "./types";

export const GetAttemptsByQuizId = (AttemptDal: AttemptDal) =>
    getAttemptsByQuizIdRequestValidator(async (req, res) => {
        const { quizId } = req.params;

        const attempts = await AttemptDal.findByQuizId(quizId).lean();

        res.status(StatusCodes.OK).send(createAttemptsResponse(attempts));
    });

export const createAttempt = (quizzesDal: QuizzesDal, AttemptDal: AttemptDal) =>
    createAttemptRequstZodSchema(async (req, res) => {
        const { quizId, questions } = req.body;

        const quiz = await quizzesDal.findById(quizId).lean();
        if (isNil(quiz)) {
            throw new BadRequestError("quiz is not exist");
        }

        const questionsResults: QuestionResult[] = questions.map(
            getQuestionResultInQuiz(quiz)
        );
        const correctAnswers = questionsResults.filter(prop("isCorrect"));

        res.send({
            quizId,
            score: Math.ceil((correctAnswers.length / questions.length) * 100),
            results: questionsResults,
        } satisfies QuizAttempt);
    });