import Joi from 'joi'

export const reportSchema = Joi.object({
  title: Joi.string().trim().required()
}).unknown(true)
