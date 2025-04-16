import { BasicDal } from "../services/database/base.dal";
import { Quiz } from "./types";

export class QuizzesDal extends BasicDal<Quiz> {
  getByLessonId = (lessonId: string) => this.model.find({ lessonId });
}
