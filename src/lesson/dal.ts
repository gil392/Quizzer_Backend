import { BasicDal } from "../services/database/base.dal";
import { Lesson } from "./model";
import { Types } from "mongoose";

export class LessonsDal extends BasicDal<Lesson> {
  override create = async (data: Partial<Lesson>) => {
    if (!data.relatedLessonGroupId) {
      data.relatedLessonGroupId = new Types.ObjectId().toString();
    }

    return await this.model.create(data);
  };

  findByUser = async (userId: string) => {
    return await this.model.find({
      $or: [{ owner: userId }, { sharedUsers: userId }],
    });
  };
}
