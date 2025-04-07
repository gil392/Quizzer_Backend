import { Types } from 'mongoose';
import { Lesson } from '../../lesson/model';
import {
    Question,
    QuestionAnswerSubmittion,
    QuestionResult,
    Quiz,
    QuizSettings
} from '../types';

export const lessonMock: Lesson & { _id: Types.ObjectId } = {
    _id: new Types.ObjectId(),
    owner: 'owner',
    sharedUsers: [],
    summary: 'summary mock',
    title: 'lesson title',
    videoUrl: 'https://video.url.com'
};

export const generatedQuestionsMock = [
    {
        _id: new Types.ObjectId(),
        question: 'question 1',
        correctAnswer: 'answer 1',
        incorrectAnswers: ['answer 2', 'answer 3', 'answer 4']
    },
    {
        _id: new Types.ObjectId(),
        question: 'question 2',
        correctAnswer: 'answer 3',
        incorrectAnswers: ['answer 1', 'answer 2', 'answer 4']
    }
] satisfies Question[];

export const quizSettings: QuizSettings = {
    checkType: 'onSubmit',
    isRandomOrder: false,
    maxQuestionCount: 10,
    solvingTimeMs: 1000 * 60 * 30
};

export const quizMock = {
    _id: new Types.ObjectId().toString(),
    lessonId: lessonMock._id.toString(),
    questions: generatedQuestionsMock,
    settings: quizSettings,
    title: lessonMock.title
} satisfies Quiz & { _id: string };

export const questionAnswerSubmittionsMock = [
    {
        questionId: generatedQuestionsMock[0]._id!.toString(),
        selectedAnswer: generatedQuestionsMock[0].correctAnswer
    },
    {
        questionId: generatedQuestionsMock[1]._id!.toString(),
        selectedAnswer: generatedQuestionsMock[1].incorrectAnswers[0]
    }
] satisfies QuestionAnswerSubmittion[];

export const questionAnswerSubmittionsMockScore = 50;
export const questionAnswerSubmittionsMockResults = [
    {
        questionId: questionAnswerSubmittionsMock[0].questionId,
        correctAnswer: generatedQuestionsMock[0].correctAnswer,
        selectedAnswer: questionAnswerSubmittionsMock[0].selectedAnswer,
        isCorrect: true
    },
    {
        questionId: questionAnswerSubmittionsMock[1].questionId,
        correctAnswer: generatedQuestionsMock[1].correctAnswer,
        selectedAnswer: questionAnswerSubmittionsMock[1].selectedAnswer,
        isCorrect: false
    }
] satisfies QuestionResult[];
