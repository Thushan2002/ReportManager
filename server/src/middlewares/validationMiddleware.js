import { ApiError } from '../utils/apiError.js'

export const validationMiddleware = (schema) => (request, _response, next) => {
  const { error, value } = schema.validate(request.body, { abortEarly: true })

  if (error) {
    return next(new ApiError(400, error.details[0].message))
  }

  request.body = value
  return next()
}