import { Schema, model, Model } from "mongoose";
import { QuizRating } from "./types";

const quizRatingSchema = new Schema<QuizRating>(
  {
    quizId: { type: String, required: true }, 
    rater: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true, versionKey: false }
);

export type QuizRatingModel = Model<QuizRating>;
export const quizRatingModel: Model<QuizRating> = model<QuizRating>(
  "quizRatings",
  quizRatingSchema
);
