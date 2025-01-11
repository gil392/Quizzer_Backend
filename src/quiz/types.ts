export const quizCheckTypes = ['onSubmit', 'onSelectAnswer'] as const;

export interface Quiz {
    title: string;
    lessonId: string;
    questions: Question[];
    grade?: number;
    setting: QuizSettings;
}

export type QuizSettings = {
    checkType: (typeof quizCheckTypes)[number];
    isRandomOrder: boolean;
    maxQuestionCount: number;
    solvingTimeMs: number;
};

export type Answer = string;

export type Question = {
    question: string;
    incorrectAnswers: Answer[];
    correctAnswer: Answer;
    selectedAnswer?: Answer;
};
