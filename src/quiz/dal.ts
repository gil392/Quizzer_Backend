import { BasicDal } from "../services/database/base.dal";
import { Question, Quiz } from "./types";

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

  findQuestionById = async (questionId: string): Promise<{ question: Question | null } > => {
    const result = await this.model.findOne(
      { "questions._id": questionId },
      { "questions.$": 1 } 
    );
  
    if (!result || !result.questions || result.questions.length === 0) {
      return { question: null}; 
    }
  
    return { question: result.questions[0] }; 
  };
}
