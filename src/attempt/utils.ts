import { isNotNil } from 'ramda';
import { Question, QuestionAnswerSubmittion, QuestionResult, Quiz, QuizResponse, QuizResponseQuestion } from '../quiz/types';


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
