import { StatusCodes } from "http-status-codes";
import { isNil, prop } from "ramda";
import { QuestionsGenerator } from "../externalApis/quizGenerator";
import { LessonsDal } from "../lesson/dal";
import { BadRequestError, NotFoundError } from "../services/server/exceptions";
import { QuizzesDal } from "./dal";
import { createQuizResponse } from "./utils";
import {
  getQuizByIdRequestValidator,
  deleteQuizRequstValidator,
  generateQuizRequstValidator,
  getQuizzesRequstValidator,
  updateQuizRequstValidator,
} from "./validators";
import { QuizzesRatingDal } from "../quizRating/dal";
import { Quiz } from "./types";

export const getQuizById = (quizzesDal: QuizzesDal) =>
  getQuizByIdRequestValidator(async (req, res) => {
    const { quizId } = req.params;

    const quiz = await quizzesDal.findById(quizId).lean();
    if (isNil(quiz)) {
      throw new NotFoundError(`could not find quiz with id ${quizId}`);
    }

    res.status(StatusCodes.OK).send(createQuizResponse(quiz));
  });

export const generateQuiz = (
  quizzesDal: QuizzesDal,
  lessonsDal: LessonsDal,
  questionsGenerator: QuestionsGenerator
) =>
  generateQuizRequstValidator(async (req, res) => {
    const {
      body: { lessonId, settings: quizSettings },
    } = req;
    const lesson = await lessonsDal.findById(lessonId).lean();
    if (isNil(lesson)) {
      throw new BadRequestError("lesson is not exist");
    }

    const questions =
      await questionsGenerator.generateQuestionsFromLessonSummary(
        lesson.summary,
        quizSettings
      );

    const quiz = await quizzesDal.create({
      title: lesson.title,
      lessonId,
      questions,
      settings: quizSettings,
    });
    res.status(StatusCodes.CREATED).send(createQuizResponse(quiz.toObject()));
  });

export const getQuizzes = (quizzesDal: QuizzesDal) =>
  getQuizzesRequstValidator(async (req, res) => {
    const { lessonId } = req.query;
    const { id: userId } = req.user;
    const quizzes: (Quiz & { ratings: { rating: number }[] })[] =
      await quizzesDal.findQuizzesWithUserRatingByLesson(lessonId, userId);
    const quizzesWithRatings = quizzes.map((quiz) => ({
      ...quiz,
      rating: quiz.ratings[0]?.rating ?? null,
    }));
    res.status(StatusCodes.OK).json(quizzesWithRatings);
  });

export const deleteQuiz = (
  quizzesDal: QuizzesDal,
  quizzesRatingDal: QuizzesRatingDal
) =>
  deleteQuizRequstValidator(async (req, res) => {
    const { id } = req.params;

    const result = await quizzesDal.deleteById(id);

    if (isNil(result)) {
      throw new NotFoundError(`Could not find quiz with id ${id}`);
    }

    await quizzesRatingDal.deleteMany({ quizId: id });

    res
      .status(StatusCodes.OK)
      .send({ message: `Quiz with id ${id} deleted successfully.` });
  });

export const updateQuiz = (quizzesDal: QuizzesDal) =>
  updateQuizRequstValidator(async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const updatedQuiz = await quizzesDal.updateById(id, {
      title,
    });

    if (!isNil(updatedQuiz)) {
      res.status(StatusCodes.OK).json(updatedQuiz.toObject());
    } else {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to update quiz" });
    }
  });
