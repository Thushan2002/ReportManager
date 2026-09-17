import Joi from "joi"

export const projectSchema = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().allow(''),
    members: Joi.array().items(Joi.string())
})