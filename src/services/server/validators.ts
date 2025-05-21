import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BadRequestError } from "./exceptions";

export const validateHandlerRequest =
  <R>(requestSchema: z.Schema<R>) =>
    (handler: (request: R, response: Response) => void | Promise<void>) =>
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const validateRequest = requestSchema.parse(request);
          await handler(validateRequest, response);
        } catch (error) {
          if (error instanceof z.ZodError) {
            console.error("validation error", error.errors);
            error = new BadRequestError("invalid request", error);
          }
          next(error);
        }
      };
