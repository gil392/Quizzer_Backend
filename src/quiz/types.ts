import { Types } from "mongoose";

export const quizCheckTypes = ["onSubmit", "onSelectAnswer"] as const;

export interface Quiz {
  title: string;
  lessonId: string;
  questions: Question[];
  grade?: number;
  settings: QuizSettings;
}

export type QuizSettings = {
  checkType: (typeof quizCheckTypes)[number];
  isRandomOrder: boolean;
  maxQuestionCount: number;
  solvingTimeMs: number;
};

export type Answer = string;

export type Question = {
  _id?: Types.ObjectId;
  question: string;
  incorrectAnswers: Answer[];
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
