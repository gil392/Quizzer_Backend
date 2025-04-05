import { isNotNil } from 'ramda';
import {
    FrontQuestion,
    FrontQuiz,
    Question,
    QuestionAnswerSubmittion,
    QuestionResult,
    Quiz
} from './types';

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
