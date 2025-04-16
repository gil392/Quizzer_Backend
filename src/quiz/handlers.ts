import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { BadRequestError, NotFoundError } from "../services/server/exceptions";
import { QuizzesDal } from "./dal";
import { QuestionResult, QuizResult } from "./types";
import { createQuizResponse, getQuestionResultInQuiz } from "./utils";
import {
    deleteQuizRequstValidator,
  generateQuizRequstValidator,
  getQuizzesByLessonIdRequstValidator,
  submitQuizRequestValidator,
  updateQuizRequstValidator,
} from "./validators";

export const generateQuiz = (
  quizzesDal: QuizzesDal,
  lessonsDal: LessonsDal,
  questionsGenerator: QuestionsGenerator
) =>
  generateQuizRequstValidator(async (req, res) => {
    const {
      body: { lessonId, settings: quizSettings },
    } = req;
    const lesson = await lessonsDal.getById(lessonId).lean();
    if (isNil(lesson)) {
      throw new BadRequestError("lesson is not exist");
    }

    const questions =
      await questionsGenerator.generateQuestionsFromLessonSummary(
        lesson.summary,
        quizSettings.maxQuestionCount
      );

    const quiz = await quizzesDal.create({
      title: lesson.title,
      lessonId,
      questions,
      settings: quizSettings,
    });
    res.status(StatusCodes.CREATED).send(createQuizResponse(quiz.toObject()));
  });

export const submitQuiz = (quizzesDal: QuizzesDal) =>
  submitQuizRequestValidator(async (req, res) => {
    const { quizId, questions } = req.body;

    const quiz = await quizzesDal.getById(quizId).lean();
    if (isNil(quiz)) {
      throw new BadRequestError("quiz is not exist");
    }

    const questionsResults = questions.map<QuestionResult>(
      getQuestionResultInQuiz(quiz)
    );
    const correctAnswers = questionsResults.filter(prop("isCorrect"));

    res.send({
      quizId,
      score: Math.ceil((correctAnswers.length / questions.length) * 100),
      results: questionsResults,
    } satisfies QuizResult);
  });

export const getQuizzesByLessonId = (quizzesDal: QuizzesDal) =>
    getQuizzesByLessonIdRequstValidator(async (req, res) => {
    const { lessonId } = req.params;
    const quizzes = await quizzesDal.getByLessonId(lessonId);
    res.status(StatusCodes.OK).json(quizzes);
  });

export const deleteQuiz =
  (quizzesDal: QuizzesDal) => 
    deleteQuizRequstValidator(async (req, res) => {
    const { id } = req.params;

    console.log("delete quiz", id);

    const quiz = await quizzesDal.getById(id).lean();
    if (isNil(quiz)) {
      throw new NotFoundError(`Could not find quiz with id ${id}`);
    }

    await quizzesDal.deleteById(id);
    res
      .status(StatusCodes.OK)
      .send({ message: `Quiz with id ${id} deleted successfully.` });
  });

  export const updateQuiz =
  (quizzesDal: QuizzesDal) => updateQuizRequstValidator(
    async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const lesson = await quizzesDal.getById(id).lean();
    if (isNil(lesson)) {
      throw new NotFoundError(`Could not find quiz with id ${id}`);
    }

    const updatedQuiz = await quizzesDal.updateById(id, {
      title,
    });

    if (updatedQuiz !== null) {
      res.status(StatusCodes.OK).json(updatedQuiz.toObject());
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to update quiz" });
    }
  });
