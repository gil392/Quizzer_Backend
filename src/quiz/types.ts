export const quizCheckTypes = ['onSubmit', 'onSelectAnswer'] as const;

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
    question: string;
    incorrectAnswers: Answer[];
    correctAnswer: Answer;
};

export type FrontQuestion = {
    text: string;
    answers: Answer[];
};
export type FrontQuiz = Omit<Quiz, 'questions'> & {
    questions: FrontQuestion[];
};
