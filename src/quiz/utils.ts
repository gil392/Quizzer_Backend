import {
    QuizResponseQuestion,
    QuizResponse,
    Question,
    Quiz
} from './types';

export const createQuizResponseQuestion = ({
    _id,
    question,
    correctAnswer,
    incorrectAnswers
}: Question): QuizResponseQuestion => ({
    _id: _id?.toString() ?? '',
    text: question,
    answers: incorrectAnswers.concat(correctAnswer),
});

export const createQuizResponse = (quiz: Quiz): QuizResponse => ({
    ...quiz,
    questions: quiz.questions.map(createQuizResponseQuestion)
});
