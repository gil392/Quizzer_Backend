import { FrontQuestion, FrontQuiz, Question, Quiz } from './types';

export const createFrontQuestion = ({
    question,
    correctAnswer,
    incorrectAnswers
}: Question): FrontQuestion => ({
    text: question,
    answers: incorrectAnswers.concat(correctAnswer)
});

export const createFrontQuiz = (quiz: Quiz): FrontQuiz => ({
    ...quiz,
    questions: quiz.questions.map(createFrontQuestion)
});
