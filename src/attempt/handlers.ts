import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { BadRequestError, NotFoundError } from "../services/server/exceptions";
import { AttemptDal } from "./dal";
import {
  getAttemptsByQuizIdRequestValidator,
  createAttemptRequestValidator,
  getQuestionResultRequestValidator,
  addAnswerToAttemptRequestValidator,
  updateAttemptWithAnswersRequestValidator,
} from "./validators";
import { getQuestionResultInQuiz } from "./utils";
import { QuizzesDal } from "../quiz/dal";
import { QuestionAttempt, QuizAttempt } from "./types";
import { UsersDal } from "../user/dal";
import { updateUserStreak } from "../user/handlers";

export const GetAttemptsByQuizId = (AttemptDal: AttemptDal) =>
  getAttemptsByQuizIdRequestValidator(async (req, res) => {
    const { quizId } = req.query;
    const { id: userId } = req.user;

    const attempts = await AttemptDal.findByQuizAndUser(quizId, userId).lean();

    res.status(StatusCodes.OK).send(attempts);
  });

export const createAttempt = (
  quizzesDal: QuizzesDal,
  attemptDal: AttemptDal,
  usersDal: UsersDal
) =>
  createAttemptRequestValidator(async (req, res) => {
    const { quizId, questions } = req.body;
    const { id: userId } = req.user;

    const quiz = await quizzesDal.findById(quizId).lean();
    if (isNil(quiz)) {
      throw new BadRequestError("Quiz does not exist");
    }

    const questionsResults: QuestionAttempt[] = questions.map(
      getQuestionResultInQuiz(quiz)
    );

    const score = attemptScore(questionsResults, quiz.questions.length);

    const attempt: QuizAttempt = {
      quizId,
      userId,
      results: questionsResults,
      score,
      expiryTime: new Date().getTime() + quiz.questions.length * 60 * 1000,
    };

    const savedAttempt = await attemptDal.create(attempt);

    await updateUserStreak(usersDal, userId);

    res.status(StatusCodes.CREATED).send(savedAttempt);
  });

export const updateAttemptWithAnswers = (
  attemptDal: AttemptDal,
  quizzesDal: QuizzesDal
) =>
  updateAttemptWithAnswersRequestValidator(async (req, res) => {
    const { attemptId, questions } = req.body;

    const attempt = await attemptDal.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError("Attempt not found");
    }

    const quiz = await quizzesDal.findById(attempt.quizId).lean();
    if (!quiz) {
      throw new BadRequestError("Quiz not found");
    }

    const questionsResults: QuestionAttempt[] = questions.map(
      getQuestionResultInQuiz(quiz)
    );

    attempt.results = questionsResults;
    attempt.score = attemptScore(questionsResults, quiz.questions.length);

    const savedAttempt = await attempt.save();

    res.status(StatusCodes.OK).json(savedAttempt);
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
  attemptDal: AttemptDal,
  quizzesDal: QuizzesDal
) =>
  addAnswerToAttemptRequestValidator(async (req, res) => {
    const { attemptId, questionId, selectedAnswer } = req.body;

    const attempt = await attemptDal.findById(attemptId);
    if (!attempt) {
      throw new NotFoundError("Attempt not found, attempt " + attemptId);
    }

    const { question } = await quizzesDal.findQuestionById(questionId);
    if (!question) {
      throw new BadRequestError("Question not found");
    }

    const quiz = await quizzesDal.findById(attempt.quizId).lean();
    if (!quiz) {
      throw new BadRequestError("Quiz not found");
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
