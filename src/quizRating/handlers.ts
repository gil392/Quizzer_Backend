import { StatusCodes } from "http-status-codes";
import { isNil } from "ramda";
import { quizRatingModel } from "./model";
import { rateQuizRequestValidator } from "./validators";
import { QuizzesDal } from "../quiz/dal";
import { NotFoundError } from "../services/server/exceptions";
import { QuizzesRatingDal } from "./dal";

export const rateQuiz = (
  quizzesDal: QuizzesDal,
  quizzesRatingDal: QuizzesRatingDal
) =>
  rateQuizRequestValidator(async (req, res) => {
    const { quizId } = req.query;
    const { rating } = req.body;
    const { id: rater } = req.user;

    const quiz = await quizzesDal.findById(quizId).lean();
    if (isNil(quiz)) {
      throw new NotFoundError(`Quiz with id ${quizId} not found.`);
    }

    if (rating !== null) {
      const updatedRating = await quizzesRatingDal.updateRating(
        quizId,
        rater,
        rating
      );
      res
        .status(StatusCodes.CREATED)
        .json({ rating: updatedRating.toObject() });
    } else {
      await quizRatingModel.deleteOne({ quizId, rater });
      res.status(StatusCodes.OK).send({
        message: `Rating for quiz ${quizId} by rater ${rater} deleted successfully.`,
      });
    }
  });
