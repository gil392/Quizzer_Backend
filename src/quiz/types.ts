export const quizCheckTypes = ['onSubmit', 'onSelectAnswer'] as const;

export type QuizSettings = {
    checkType: typeof quizCheckTypes[number];
    isRandomOrder: boolean;
    maxQuestionCount: number;
    solvingTimeMs: number;
};

export type Answer = string;

export type Question = {
    question: string;
    incorrectAnswers: Answer[];
    correctAnswer: Answer;
    points: number;
    selectedAnswer?: Answer;
};
