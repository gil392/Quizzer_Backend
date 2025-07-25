import { Types } from "mongoose";

export const quizFeedbacks = ["onSubmit", "onSelectAnswer"] as const;
export const quizQuestionsOrders = ["chronological", "random"] as const;

export interface Quiz {
  title: string;
  lessonId: string;
  questions: Question[];
  grade?: number;
  settings: QuizSettings;
}

export type QuizSettings = {
  feedbackType: (typeof quizFeedbacks)[number];
  questionsOrder: (typeof quizQuestionsOrders)[number];
  maxQuestionCount: number;
  solvingTimeMs: number;
};

export type Answer = string;

export type Question = {
  _id?: Types.ObjectId;
  question: string;
  answers: Answer[];
  correctAnswer: Answer;
};

export type QuizResponseQuestion = {
  _id: string;
  text: string;
  answers: Answer[];
};
export type QuizResponse = Omit<Quiz, "questions"> & {
  questions: QuizResponseQuestion[];
};
