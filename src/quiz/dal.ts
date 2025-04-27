import { BasicDal } from "../services/database/base.dal";
import { Quiz } from "./types";

export class QuizzesDal extends BasicDal<Quiz> {
  findByLessonId = (lessonId: string | undefined) => {
    const filter = lessonId ? { lessonId } : {};
    return this.model.find(filter);
  };
}
