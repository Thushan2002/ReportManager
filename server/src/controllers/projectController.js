import Project from '../schemas/Project.js'
import {ApiError} from '../utils/apiError.js'
import {createProject, listProjects, removeProject, updateProject} from '../services/projectService.js'

export const list = async (_request, response) => {
  const result = await listProjects()
  response.json({projects: result.projects})
}

export const create = async (request, response) => {
  const result = await createProject(request.body)
  response.status(201).json({project: result.project})
}

export const update = async (request, response) => {
  const result = await updateProject({body: request.body, params: request.params})
  response.status(200).json({project: result.project})
}

export const remove = async (request, response) => {
  const result = await removeProject(request.params)
  response.status(200).json({project: result.projectId})
}