import { isNotNil } from 'ramda';
import {
    QuizResponseQuestion,
    QuizResponse,
    Question,
    QuestionAnswerSubmittion,
    QuestionResult,
    Quiz
} from './types';

export const createQuizResponseQuestion = ({
    question,
    correctAnswer,
    incorrectAnswers
}: Question): QuizResponseQuestion => ({
    text: question,
    answers: incorrectAnswers.concat(correctAnswer)
});

export const createQuizResponse = (quiz: Quiz): QuizResponse => ({
    ...quiz,
    questions: quiz.questions.map(createQuizResponseQuestion)
});

const findQuestionById = (questions: Question[], id: string) =>
    questions.find(({ _id }) => (_id?.toString() ?? '') === id);

export const getQuestionResultInQuiz =
    (quiz: Quiz) =>
    (questionAnswerSubmittion: QuestionAnswerSubmittion): QuestionResult => {
        const { questionId, selectedAnswer } = questionAnswerSubmittion;
        const question = findQuestionById(quiz.questions, questionId);
        const correctAnswer = question?.correctAnswer ?? '';

        return {
            correctAnswer,
            selectedAnswer,
            questionId,
            isCorrect: isNotNil(question) && selectedAnswer === correctAnswer
        };
    };
