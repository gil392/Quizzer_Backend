import { Lesson } from '../lesson/model';
import { Question } from '../quiz/types';

export class QuestionsGenerator {
    constructor() {}

    // TODO: replace stub with real call from external api
    generateQuestionsFromLessonSummary = async (
        _summary: Lesson['summary']
    ): Promise<Question[]> => [
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
}
