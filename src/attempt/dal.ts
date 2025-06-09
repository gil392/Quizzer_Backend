import { BasicDal } from "../services/database/base.dal";
import { QuizAttempt } from "./types";

export class AttemptDal extends BasicDal<QuizAttempt> {
  findByQuizAndUser = (quizId: string, userId: string) => {
    return this.model.find({ quizId, userId });
  };
}
