import Project from '../schemas/Project.js'
import {ApiError} from '../utils/apiError.js'
import {createProject, listProjects} from '../services/projectService.js'

export const list = async (_request, response) => {
  const result = await listProjects()
  response.json({reports: result.reports})
}

export const create = async (request, response) => {
  const result = await createProject(request.body)
  response.status(201).json({report: result.report})
}

export const update = async (request, response) => {
  const project = await Project.findByIdAndUpdate(request.params.id, request.body, {new: true, runValidators: true}).populate('members', 'name email role')
  if (!project) throw new ApiError(404, 'Project not found')
  response.json(project)
}

export const remove = async (request, response) => {
  const project = await Project.findByIdAndDelete(request.params.id)
  if (!project) throw new ApiError(404, 'Project not found')
  response.status(204).send()
}