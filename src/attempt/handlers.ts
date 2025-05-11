import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { BadRequestError } from "../services/server/exceptions";
import { AttemptDal } from "./dal";
import {
    getAttemptsByQuizIdRequestValidator,
    createAttemptRequestValidator,
} from "./validators";
import { getQuestionResultInQuiz, createAttemptsResponse } from "./utils";
import { QuizzesDal } from "../quiz/dal";
import { QuestionResult } from "../quiz/types";
import { QuizAttempt } from "./types";

/*export const GetAttemptsByQuizId = (AttemptDal: AttemptDal) =>
    getAttemptsByQuizIdRequestValidator(async (req, res) => {
        const { quizId } = req.params;

        const attempts = await AttemptDal.findByQuizId(quizId).lean();

        res.status(StatusCodes.OK).send(createAttemptsResponse(attempts));
    });*/

export const createAttempt = (quizzesDal: QuizzesDal, AttemptDal: AttemptDal) =>
    createAttemptRequestValidator(async (req, res) => {
        const { quizId, questions } = req.body;

        const quiz = await quizzesDal.findById(quizId).lean();
        if (isNil(quiz)) {
            throw new BadRequestError("Quiz does not exist");
        }


        const questionsResults: QuestionResult[] = questions.map(
            getQuestionResultInQuiz(quiz)
        );

        const correctAnswersCount = questionsResults.filter(prop("isCorrect")).length;
        const score = Math.ceil((correctAnswersCount / questions.length) * 100);

        const attempt: QuizAttempt = {
            quizId,
            results: questionsResults,
            score,
        };

        const savedAttempt = await AttemptDal.create(attempt);

        res.status(StatusCodes.CREATED).send(savedAttempt);
    });