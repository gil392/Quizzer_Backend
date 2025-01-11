import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export const generateQuiz = (_req: Request, res: Response) => {
    res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};

export const getQuizzes = (_req: Request, res: Response) => {
    res.sendStatus(StatusCodes.NOT_IMPLEMENTED);
};
