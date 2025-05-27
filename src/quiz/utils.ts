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
    answers: incorrectAnswers.concat(correctAnswer), //TODO: This is a problem. once fixed in the other PR, There will be no more duplucate answers
});

export const createQuizResponse = (quiz: Quiz): QuizResponse => ({
    ...quiz,
    questions: quiz.questions.map(createQuizResponseQuestion)
});
