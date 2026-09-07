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
  response.status(201).json(await inviteUser(request.body))
}

export const currentUser = async (request, response) => {
  response.json({user: await getPublicUserById(request.user.id)})
}

export const logout = (_request, response) => {
  clearSessionCookie(response)
  response.status(204).send()
}
