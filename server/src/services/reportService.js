import Report from '../schemas/Report.js'
import { ROLES } from '../constants/roles.js'

export const listReports = ({ id, role }) => {
	const filter = Number(role) === ROLES.ADMIN ? {} : { owner: id }
	return Report.find(filter).sort({ updatedAt: -1 })
}

export const createReport = (ownerId, reportData) => Report.create({ ...reportData, owner: ownerId })

export const getReport = (ownerId, reportId) => Report.findOne({ _id: reportId, owner: ownerId })

export const deleteReport = (ownerId, reportId) => Report.findOneAndDelete({ _id: reportId, owner: ownerId })
