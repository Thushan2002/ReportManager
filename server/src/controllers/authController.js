import {getPublicUserById, inviteUser, loginUser, registerUser} from '../services/authService.js'
import {clearSessionCookie, setSessionCookie} from '../utils/session.js'

export const register = async (request, response) => {
  const result = await registerUser(request.body)
  setSessionCookie(response, result.token)
  response.status(201).json({user: result.user})
}

export const login = async (request, response) => {
  const result = await loginUser(request.body)
  setSessionCookie(response, result.token)
  response.json({user: result.user})
}

export const invite = async (request, response) => {
  const result = await inviteUser(request.body)
  response.status(201).json({user: result.user})
}

export const currentUser = async (request, response) => {
  const result = await getPublicUserById(request.user.id)
  response.json({user: result.user})
}

export const logout = (_request, response) => {
  clearSessionCookie(response)
  response.status(204).send()
}
