import Report from '../schemas/Report.js'
import {ROLES} from '../constants/roles.js'
import {ApiError} from '../utils/apiError.js'

export const listReports = ({id, role}, query = {}) => {
	const filter = Number(role) === ROLES.ADMIN ? {} : {owner: id}
	if (query.status) filter.status = query.status
	if (query.project) filter.project = query.project
	if (query.owner && Number(role) === ROLES.ADMIN) filter.owner = query.owner
	if (query.from || query.to) {
		filter.weekStart = {}
		if (query.from) filter.weekStart.$gte = new Date(query.from)
		if (query.to) filter.weekStart.$lte = new Date(query.to)
	}
	return Report.find(filter).populate('owner', 'name email role').sort({weekStart: -1, updatedAt: -1})
}

export const createReport = (ownerId, reportData) => Report.create({...reportData, owner: ownerId})

export const getReport = (user, reportId) => {
	const filter = Number(user.role) === ROLES.ADMIN ? {_id: reportId} : {_id: reportId, owner: user.id}
	return Report.findOne(filter).populate('owner', 'name email role').populate('reviewedBy', 'name email')
}

export const updateReport = async (user, reportId, reportData) => {
	const report = await Report.findOne({_id: reportId, owner: user.id})
	if (!report) throw new ApiError(404, 'Report not found')
	if (!['Draft', 'Needs Correction'].includes(report.status)) throw new ApiError(409, 'Only draft reports or reports needing correction can be edited')
	Object.assign(report, reportData)
	return report.save()
}

export const submitReport = async (userId, reportId) => {
	const report = await Report.findOne({_id: reportId, owner: userId})
	if (!report) throw new ApiError(404, 'Report not found')
	if (!['Draft', 'Needs Correction'].includes(report.status)) throw new ApiError(409, 'This report cannot be submitted in its current status')
	if (report.status === 'Needs Correction') {
		report.versions.push({version: report.versions.length + 1, submittedAt: new Date(), reviewComment: report.reviewComment, content: report.toObject()})
	}
	report.status = 'Submitted'
	report.reviewComment = ''
	report.reviewedAt = null
	report.reviewedBy = null
	return report.save()
}

export const reviewReport = async (reviewerId, reportId, {action, comment}) => {
	const report = await Report.findById(reportId)
	if (!report) throw new ApiError(404, 'Report not found')
	if (report.status !== 'Submitted') throw new ApiError(409, 'Only submitted reports can be reviewed')
	report.status = action === 'approve' ? 'Approved' : 'Needs Correction'
	report.reviewComment = action === 'approve' ? '' : comment
	report.reviewedAt = new Date()
	report.reviewedBy = reviewerId
	return report.save()
}

export const deleteReport = (ownerId, reportId) => Report.findOneAndDelete({_id: reportId, owner: ownerId, status: 'Draft'})

export const dashboardMetrics = async () => {
	const weekStart = new Date()
	weekStart.setHours(0, 0, 0, 0)
	weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
	const reports = await Report.find({weekStart: {$gte: weekStart}}).populate('owner', 'name')
	const submitted = reports.filter((report) => ['Submitted', 'Approved'].includes(report.status)).length
	const blockers = reports.filter((report) => report.blockers?.trim()).length
	const byStatus = reports.reduce((result, report) => {result[report.status] = (result[report.status] || 0) + 1; return result}, {})
	const byProject = reports.reduce((result, report) => {result[report.project] = (result[report.project] || 0) + report.tasks.length; return result}, {})
	const timeByType = reports.reduce((result, report) => {Object.entries(report.hours?.toObject?.() || report.hours || {}).forEach(([key, value]) => {result[key] = (result[key] || 0) + value}); return result}, {})
	return {total: reports.length, submitted, correction: byStatus['Needs Correction'] || 0, blockers, byStatus, byProject, timeByType}
}
