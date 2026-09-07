import {ApiError} from '../utils/apiError.js'
import {createReport, dashboardMetrics, deleteReport, getReport, getTeamPulse, listReports, reviewReport, submitReport, updateReport} from '../services/reportService.js'

export const list = async (request, response) => {
  response.json(await listReports(request.user, request.query))
}

export const create = async (request, response) => {
  response.status(201).json(await createReport(request.user.id, request.body))
}

export const get = async (request, response) => {
  const report = await getReport(request.user, request.params.id)
  if (!report) throw new ApiError(404, 'Report not found')
  response.json(report)
}

export const update = async (request, response) => response.json(await updateReport(request.user, request.params.id, request.body))

export const submit = async (request, response) => response.json(await submitReport(request.user.id, request.params.id))

export const review = async (request, response) => response.json(await reviewReport(request.user.id, request.params.id, request.body))

export const metrics = async (_request, response) => response.json(await dashboardMetrics())

export const pulse = async (request, response) => response.json(await getTeamPulse(request.query.weekStart))

export const remove = async (request, response) => {
  const report = await deleteReport(request.user.id, request.params.id)
  if (!report) throw new ApiError(404, 'Report not found')
  response.status(204).send()
}
