import Joi from 'joi'

export const managerChatSchema = Joi.object({
  question: Joi.string().trim().min(2).max(1000).required()
}).required()