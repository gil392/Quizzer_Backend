import { BasicDal } from "../services/database/base.dal";
import { QuizAttempt } from "./types";

export class AttemptDal extends BasicDal<QuizAttempt> {
  findByQuizId = (quizId: string) => {
    return this.model.find({ quizId });
  };
}