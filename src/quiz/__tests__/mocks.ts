import { Types } from 'mongoose';
import { Lesson } from '../../lesson/model';
import { Question, QuizSettings } from '../types';

export const lessonMock: Lesson & { _id: Types.ObjectId } = {
    _id: new Types.ObjectId(),
    owner: 'owner',
    sharedUsers: [],
    summary: 'summary mock',
    title: 'lesson title',
    videoUrl: 'https://video.url.com'
};

export const generatedQuestionsMock: Question[] = [
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
