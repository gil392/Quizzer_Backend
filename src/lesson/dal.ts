import { BasicDal } from "../services/database/base.dal";
import { Lesson } from "./model";

export class LessonsDal extends BasicDal<Lesson> {
  override create = async (data: Partial<Lesson>) => {
    const lesson = await this.model.create(data);

    if (!lesson.relatedLessonId) {
      lesson.relatedLessonId = lesson._id.toString();
      await lesson.save();
    }

    return lesson;
  };
}
