import { inviteUser, loginUser, registerUser } from '../services/authService.js'

export const register = async (request, response) => {
  response.status(201).json(await registerUser(request.body))
}

export const login = async (request, response) => {
  response.json(await loginUser(request.body))
}

export const invite = async (request, response) => {
  response.json(await inviteUser(request.body))
}
