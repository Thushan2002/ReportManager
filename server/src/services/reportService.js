import Report from '../schemas/Report.js'

export const listReports = (ownerId) => Report.find({ owner: ownerId }).sort({ updatedAt: -1 })

export const createReport = (ownerId, reportData) => Report.create({ ...reportData, owner: ownerId })

export const getReport = (ownerId, reportId) => Report.findOne({ _id: reportId, owner: ownerId })

export const deleteReport = (ownerId, reportId) => Report.findOneAndDelete({ _id: reportId, owner: ownerId })
