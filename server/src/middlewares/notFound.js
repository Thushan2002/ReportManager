import {NotFoundError} from "../utils/notFoundError.js"

export const notFound = (request, _response, next) => {
  const error = new NotFoundError(404, `Route not found: ${request.method} ${request.originalUrl}`)
  next(error)
}
