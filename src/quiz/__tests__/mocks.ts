import { QuizSettings } from '../types';

export const generatedQuestionsMock = [
    {
        question: 'question 1',
        correctAnswer: 'answer 1',
        incorrectAnswers: ['answer 2', 'answer 3', 'answer 4']
    },
    {
        question: 'question 2',
        correctAnswer: 'answer 3',
        incorrectAnswers: ['answer 1', 'answer 2', 'answer 4']
    }
];

export const quizSettings: QuizSettings = {
    checkType: 'onSubmit',
    isRandomOrder: false,
    maxQuestionCount: 10,
    solvingTimeMs: 1000 * 60 * 30
};
