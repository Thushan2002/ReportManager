import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../schemas/User.js'
import { config } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

const createToken = (user) => jwt.sign({ id: user._id, email: user.email }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) throw new ApiError(409, 'An account with that email already exists')

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email, passwordHash })
  return { user: { id: user.id, name: user.name, email: user.email }, token: createToken(user) }
}

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash')
  const validPassword = user && await bcrypt.compare(password, user.passwordHash)
  if (!validPassword) throw new ApiError(401, 'Invalid email or password')

  return { user: { id: user.id, name: user.name, email: user.email }, token: createToken(user) }
}
