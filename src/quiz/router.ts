import { Router } from 'express';
import * as handlers from './handlers';


export const createQuizRouter = (): Router => {
    const router = Router();

    router.get('/', handlers.getQuizzes);
    router.post('/', handlers.generateQuiz);

    return router;
};
