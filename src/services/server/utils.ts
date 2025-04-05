import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { RequestHandlingError } from './exceptions';

export const requestErrorHandler = (
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction
) => {
    if (error instanceof RequestHandlingError) {
        response
            .status(error.status)
            .json({ message: error.message, error: error.cause });
    } else {
        response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }
};
