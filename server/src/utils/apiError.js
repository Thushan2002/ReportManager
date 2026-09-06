export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}