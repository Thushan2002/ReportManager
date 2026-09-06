export const asyncHandler = (handler) => (request, response, next) => {
  try {
    Promise.resolve(handler(request, response, next)).catch(next)
  } catch (error) {
    next(error)
  }
}