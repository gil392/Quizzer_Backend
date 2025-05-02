import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { quizRatingModel } from "./model";
import { rateQuizRequestValidator } from "./validators";
import { QuizzesDal } from "../quiz/dal";
import { NotFoundError } from "../services/server/exceptions";

export const rateQuiz = (quizzesDal: QuizzesDal) =>
  rateQuizRequestValidator(async (req, res) => {
    const { quizId, rater } = req.query;
    const { rating } = req.body;

    const quiz = await quizzesDal.findById(quizId).lean();
    if (isNil(quiz)) {
      throw new NotFoundError(`Quiz with id ${quizId} not found.`);
    }

    const updatedRating = await quizRatingModel.findOneAndUpdate(
      { quizId, rater }, // Match by quizId and rater to decide if to update or create a new one
      { quizId, rater, rating },
      { new: true, upsert: true }
    );

    res.status(StatusCodes.CREATED).send({
      message: `Rating for quiz ${quizId} by rater ${rater} submitted successfully.`,
      rating: updatedRating,
    });
  });
