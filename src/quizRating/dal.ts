import { BasicDal } from "../services/database/base.dal";
import { quizRatingModel } from "./model";
import { QuizRating } from "./types";

export class QuizzesRatingDal extends BasicDal<QuizRating> {
  updateRating = async (quizId: string, rater: string, rating: number) => {
    return await quizRatingModel.findOneAndUpdate(
      { quizId, rater }, // Match by quizId and rater to decide if to update or create a new one
      { quizId, rater, rating },
      { new: true, upsert: true }
    );
  };
}
