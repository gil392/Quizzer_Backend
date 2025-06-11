import { Types } from "mongoose";
import { BasicDal } from "../services/database/base.dal";
import { QuizAttempt } from "./types";

export class AttemptDal extends BasicDal<QuizAttempt> {
  findByQuizAndUser = (quizId: string, userId: string) => {
    return this.model.find({ quizId, userId });
  };

  findByLessonAndUser = async (lessonId: string, userId: string) => {
    return (await this.model.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $addFields: {
          quizIdObject: { $toObjectId: "$quizId" },
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "quizIdObject",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },
      {
        $match: {
          "quiz.lessonId": lessonId,
        },
      },
    ])) as QuizAttempt[];
  };
}
