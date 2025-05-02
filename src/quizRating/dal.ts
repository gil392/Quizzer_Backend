import { BasicDal } from "../services/database/base.dal";
import { QuizRating } from "./types";

export class QuizzesRatingDal extends BasicDal<QuizRating> {
  findByQuizId = (quizId: string | undefined) => {
    const filter = quizId ? { quizId } : {};
    return this.model.find(filter);
  };

  findByRater = (rater: string | undefined) => {
    const filter = rater ? { rater } : {};
    return this.model.find(filter);
  };
}