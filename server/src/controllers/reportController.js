import {createReport, dashboardMetrics, deleteReport, getReport, getTeamPulse, listReports, reviewReport, submitReport, updateReport} from '../services/reportService.js'

export const list = async (request, response) => {
  const result = await listReports({user: request.user, query: request.query})
  response.json({reportsList: result.reports})
}

export const create = async (request, response) => {
  const result = await createReport({ownerId: request.user.id, reportData: request.body})
  response.status(201).json({report: result.report})
}

export const get = async (request, response) => {
  const result = await getReport({user: request.user, reportId: request.params.id})
  response.json({report: result.report})
}

export const update = async (request, response) => {
  const result = await updateReport({user: request.user, reportId: request.params.id, reportData: request.body})
  response.json({report: result.report})
}

export const submit = async (request, response) => {
  const result = await submitReport({userId: request.user.id, reportId: request.params.id})
  response.json({report: result.report})
}

export const review = async (request, response) => {
  const result = await reviewReport({reviewerId: request.user.id, reportId: request.params.id, reviewData: request.body})
  response.json({report: result.report})
}

export const metrics = async (_request, response) => response.json(await dashboardMetrics())

export const pulse = async (request, response) => response.json(await getTeamPulse(request.query.weekStart))

export const remove = async (request, response) => {
  const result = await deleteReport({ownerId: request.user.id, reportId: request.params.id})
  response.status(200).json({reportId: result.reportId})
}
