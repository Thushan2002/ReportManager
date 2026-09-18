import Project from '../schemas/Project.js'
import Report from '../schemas/Report.js'
import {ApiError} from '../utils/apiError.js'

export const listProjects = async () => {
  const projects = await Project.find().populate('members', 'name email role').sort({name: 1})
  const reportCounts = await Report.aggregate([
    {$group: {_id: '$project', count: {$sum: 1}}}
  ])
  const countMap = Object.fromEntries(reportCounts.map(r => [r._id, r.count]))

  const result = projects.map(p => ({
    ...p.toObject(),
    reportsCount: countMap[p.name] || 0
  }))

  return {
    projects: result
  }
}

export const createProject = async ({name, description, members}) => {
  const project = await Project.create({name, description, members})
  const populated = await Project.findById(project._id).populate('members', 'name email role')

  return {
    project: populated
  }
}

export const updateProject = async ({body, params}) => {
  const project = await Project.findByIdAndUpdate(params.id, body, {new: true, runValidators: true}).populate('members', 'name email role')
  if (!project) throw new ApiError(404, 'Project not found')

  return {
    project: project
  }
}

export const removeProject = async ({id}) => {
  const project = await Project.findByIdAndDelete(id)
  if (!project) throw new ApiError(404, 'Project not found')

  return {
    projectId: id
  }
}