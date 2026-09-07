import Joi from 'joi'
import { ROLES } from '../constants/roles.js'

export const registrationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

export const inviteUserSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  role: Joi.number().valid(...Object.values(ROLES)).required(),
  password: Joi.string().min(8).required()
})