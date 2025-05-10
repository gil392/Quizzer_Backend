import { BasicDal } from "../services/database/base.dal";
import { Quiz } from "./types";

export class QuizzesDal extends BasicDal<Quiz> {
  findQuizzesWithUserRatingByLesson = (
    lessonId: string | undefined,
    raterId: string | undefined
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
          pipeline: raterId
            ? [{ $match: { rater: raterId } }, { $limit: 1 }]
            : [], // If no userId, include all ratings
        },
      },
    ]);
  };
}
