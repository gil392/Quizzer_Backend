import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { RequestHandlingError } from "./exceptions";

export const requestErrorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof RequestHandlingError) {
    console.error({ message: error.message, error: error.cause });
    response
      .status(error.status)
      .send({ message: error.message, error: error.cause });
  } else {
    console.error({ message: 'INTERNAL_SERVER_ERROR', error });
    response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
  }
};
