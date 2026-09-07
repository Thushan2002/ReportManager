import { ApiError } from '../utils/apiError.js'
import { createReport, deleteReport, getReport, listReports } from '../services/reportService.js'

export const list = async (request, response) => {
  response.json(await listReports(request.user.id))
}

export const create = async (request, response) => {
  response.status(201).json(await createReport(request.user.id, request.body))
}

export const get = async (request, response) => {
  const report = await getReport(request.user.id, request.params.id)
  if (!report) throw new ApiError(404, 'Report not found')
  response.json(report)
}

export const remove = async (request, response) => {
  const report = await deleteReport(request.user.id, request.params.id)
  if (!report) throw new ApiError(404, 'Report not found')
  response.status(204).send()
}
