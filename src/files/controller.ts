import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { InternalServerError } from "../services/server/exceptions";

export const responseForUploadedFile =
  (serverUrl: string, prefix: string = "") =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      next(new InternalServerError("file is not exist in request"));
    } else {
      res.status(StatusCodes.OK).send(serverUrl + prefix + req.file.filename);
    }
  };
