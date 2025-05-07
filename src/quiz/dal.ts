import { BasicDal } from "../services/database/base.dal";
import { Quiz } from "./types";

export class QuizzesDal extends BasicDal<Quiz> {
  findByLessonAndUser = (
    lessonId: string | undefined,
    userId: string | undefined
  ) => {
    const filter = lessonId ? { lessonId } : {};

    return this.model.aggregate([
      { $match: filter },
      {
        $addFields: {
          idAsString: { $toString: "$_id" }, 
        },
      },
      {
        $lookup: {
          from: "quizratings",
          localField: "idAsString",
          foreignField: "quizId",
          as: "ratings",
          pipeline: userId
            ? [
                { $match: { rater: userId } },
              ]
            : [], // If no userId, include all ratings
          
        },
      },
    ]);
  };
}
