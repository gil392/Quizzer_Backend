import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { BadRequestError } from "../services/server/exceptions";
import { AttemptDal } from "./dal";
import {
  getAttemptsByQuizIdRequestValidator,
  createAttemptRequestValidator,
  getQuestionResultRequestValidator,
  addAnswerToAttemptRequestValidator,
} from "./validators";
import { getQuestionResultInQuiz } from "./utils";
import { QuizzesDal } from "../quiz/dal";
import { QuestionAttempt, QuizAttempt } from "./types";
import { UsersDal } from "../user/dal";
import { updateUserStreak } from "../user/handlers";

export const GetAttemptsByQuizId = (AttemptDal: AttemptDal) =>
  getAttemptsByQuizIdRequestValidator(async (req, res) => {
    const { quizId } = req.query;

    const attempts = await AttemptDal.findByQuizId(quizId).lean();

    res.status(StatusCodes.OK).send(attempts);
  });

export const createAttempt = (
  quizzesDal: QuizzesDal,
  AttemptDal: AttemptDal,
  usersDal: UsersDal
) =>
  createAttemptRequestValidator(async (req, res) => {
    const { quizId, questions } = req.body;

    const quiz = await quizzesDal.findById(quizId).lean();
    if (isNil(quiz)) {
      throw new BadRequestError("Quiz does not exist");
    }

    const questionsResults: QuestionAttempt[] = questions.map(
      getQuestionResultInQuiz(quiz)
    );

    const score = attemptScore(questionsResults, questions.length);

    const attempt: QuizAttempt = {
      quizId,
      results: questionsResults,
      score,
    };

    const savedAttempt = await AttemptDal.create(attempt);

    const { id: userId } = req.user;
    await updateUserStreak(usersDal, userId);

    res.status(StatusCodes.CREATED).send(savedAttempt);
  });

export const getQuestionResult = (quizzesDal: QuizzesDal) =>
  getQuestionResultRequestValidator(async (req, res) => {
    const { questionId } = req.params;
    const { selectedAnswer } = req.query;

    const { question } = await quizzesDal.findQuestionById(questionId);

    if (isNil(question)) {
      throw new BadRequestError("Question not found");
    }

    res.status(StatusCodes.OK).send({
      questionId,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: question.correctAnswer === selectedAnswer,
    });
  });

export const addAnswerToAttempt = (
  AttemptDal: AttemptDal,
  quizzesDal: QuizzesDal
) =>
  addAnswerToAttemptRequestValidator(async (req, res) => {
    const { attemptId, questionId, selectedAnswer } = req.body;

    const attempt = await AttemptDal.findById(attemptId);
    if (!attempt) {
      console.warn("Attempt not found", attemptId);
      res.status(StatusCodes.NOT_FOUND).json({ message: "Attempt not found" });
      return;
    }

    const { question } = await quizzesDal.findQuestionById(questionId);
    if (!question) {
      console.warn("Question not found", questionId);
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Question not found" });
      return;
    }

    const quiz = await quizzesDal.findById(attempt.quizId).lean();
    if (!quiz) {
      console.warn("Quiz not found", attempt.quizId);
      res.status(StatusCodes.BAD_REQUEST).json({ message: "Quiz not found" });
      return;
    }

    const questionResult = getQuestionResultInQuiz(quiz)({
      questionId,
      selectedAnswer,
    });

    const existingIndex = attempt.results.findIndex(
      (r) => r.questionId === questionId
    );
    if (existingIndex !== -1) {
      attempt.results[existingIndex] = questionResult;
    } else {
      attempt.results.push(questionResult);
    }

    attempt.score = attemptScore(attempt.results, quiz.questions.length);

    const savedAttempt = await attempt.save();

    res.status(StatusCodes.OK).json(savedAttempt);
  });

function attemptScore(
  questionsResults: QuestionAttempt[],
  questionsLength: number
) {
  if (questionsLength === 0 || questionsResults.length === 0) return 0;
  const correctAnswersCount = questionsResults.filter(prop("isCorrect")).length;
  const score = Math.ceil((correctAnswersCount / questionsLength) * 100);
  return score;
}
