import { ApiError } from '../utils/apiError.js'

export const validateRegistration = ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required')
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters')
  }
}

export const validateLogin = ({ email, password }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required')
  }
}
