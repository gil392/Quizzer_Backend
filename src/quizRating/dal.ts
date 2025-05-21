import { BasicDal } from "../services/database/base.dal";
import { quizRatingModel } from "./model";
import { QuizRating } from "./types";

export class QuizzesRatingDal extends BasicDal<QuizRating> {
  updateRating = (quizId: string, rater: string, rating: number) =>
    this.model.findOneAndUpdate(
      { quizId, rater }, // Match by quizId and rater to decide if to update or create a new one
      { quizId, rater, rating },
      { new: true, upsert: true }
    );
}
