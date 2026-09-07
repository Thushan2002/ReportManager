import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../schemas/User.js'
import { config } from '../config/env.js'
import { ApiError } from '../utils/apiError.js'

const DUPLICATE_KEY_ERROR_CODE = 11000

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  })

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) throw new ApiError(409, 'An account with that email already exists')

  const passwordHash = await bcrypt.hash(password, 12)

  let user
  try {
    user = await User.create({ name, email, passwordHash })
  } catch (error) {
    if (error.code === DUPLICATE_KEY_ERROR_CODE) {
      throw new ApiError(409, 'An account with that email already exists')
    }
    throw error
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: createToken(user)
  }
}

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash')
  const validPassword = user && (await bcrypt.compare(password, user.passwordHash))
  if (!validPassword) throw new ApiError(401, 'Invalid email or password')

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: createToken(user)
  }
}

export const inviteUser = async ({ name, email, role, password }) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) throw new ApiError(409, 'An account with that email already exists')

  const passwordHash = await bcrypt.hash(password, 12)

  let user
  try {
    user = await User.create({ name, email, role, passwordHash })
  } catch (error) {
    if (error.code === DUPLICATE_KEY_ERROR_CODE) {
      throw new ApiError(409, 'An account with that email already exists')
    }
    throw error
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: createToken(user)
  }
}