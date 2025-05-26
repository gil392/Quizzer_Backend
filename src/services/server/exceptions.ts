import { StatusCodes } from 'http-status-codes';

export class RequestHandlingError extends Error {
    constructor(public status: number, message?: string, public cause?: Error) {
        super(message);
    }
}

export class InternalServerError extends RequestHandlingError {
    constructor(message?: string, public cause?: Error) {
        super(StatusCodes.INTERNAL_SERVER_ERROR, message, cause);
    }
}

export class BadRequestError extends RequestHandlingError {
    constructor(message?: string, public cause?: Error) {
        super(StatusCodes.BAD_REQUEST, message, cause);
    }
}

export class NotFoundError extends RequestHandlingError {
    constructor(message?: string, public cause?: Error) {
        super(StatusCodes.NOT_FOUND, message, cause);
    }
}

export class UnauthorizedError extends RequestHandlingError {
    constructor(message?: string, public cause?: Error) {
        super(StatusCodes.UNAUTHORIZED, message, cause);
    }
}