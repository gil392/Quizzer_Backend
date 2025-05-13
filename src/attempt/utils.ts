import { isNotNil } from 'ramda';
import { Question, QuestionAnswerSubmittion, Quiz } from '../quiz/types';
import { QuestionAttempt } from './types';


const findQuestionById = (questions: Question[], id: string) =>
    questions.find(({ _id }) => (_id?.toString() ?? '') === id);

export const getQuestionResultInQuiz =
    (quiz: Quiz) =>
    (questionAnswerSubmittion: QuestionAnswerSubmittion): QuestionAttempt => {
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
