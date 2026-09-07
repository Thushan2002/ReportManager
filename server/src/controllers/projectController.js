import Project from '../schemas/Project.js'
import {ApiError} from '../utils/apiError.js'

export const list = async (_request, response) => response.json(await Project.find().populate('members', 'name email').sort({name: 1}))

export const create = async (request, response) => response.status(201).json(await Project.create(request.body))

export const update = async (request, response) => {
    const project = await Project.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true})
    if (!project) throw new ApiError(404, 'Project not found')
    response.json(project)
}

export const remove = async (request, response) => {
    const project = await Project.findByIdAndDelete(request.params.id)
    if (!project) throw new ApiError(404, 'Project not found')
    response.status(204).send()
}