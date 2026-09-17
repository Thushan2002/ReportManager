export class NotFoundError extends Error {
    constructor(statusCode, message) {
        super(message)
        this.name = "NotFoundError"
        this.statusCode = statusCode

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotFoundError)
        }
    }
}