import { listUsers, getUserStats, updateUser, deleteUser, changePassword } from '../services/userService.js'

export const list = async (_request, response) => {
  response.json(await listUsers())
}

export const getStats = async (request, response) => {
  response.json(await getUserStats(request.params.id))
}

export const update = async (request, response) => {
  response.json(await updateUser(request.params.id, request.body))
}

export const remove = async (request, response) => {
  response.json(await deleteUser(request.params.id, request.user))
}

export const updatePassword = async (request, response) => {
  response.json(await changePassword(request.user.id, request.body))
}

export const updateOwnProfile = async (request, response) => {
  response.json(await updateUser(request.user.id, { name: request.body.name }))
}
