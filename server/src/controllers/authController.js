import { loginUser, registerUser } from '../services/authService.js'
import { validateLogin, validateRegistration } from '../validations/auth.js'

export const register = async (request, response) => {
  validateRegistration(request.body)
  response.status(201).json(await registerUser(request.body))
}

export const login = async (request, response) => {
  validateLogin(request.body)
  response.json(await loginUser(request.body))
}
