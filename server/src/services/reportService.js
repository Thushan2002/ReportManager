import Report from '../schemas/Report.js'
import User from '../schemas/User.js'
import {ROLES} from '../constants/roles.js'
import {ApiError} from '../utils/apiError.js'

const getWeekBounds = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  const weekStart = new Date(d.setDate(diff))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)
  return {weekStart, weekEnd}
}

export const listReports = ({id, role}, query = {}) => {
  const filter = Number(role) === ROLES.ADMIN ? {} : {owner: id}

  if (query.status) {
    filter.status = query.status
  }
  if (query.project) {
    filter.project = query.project
  }
  if (query.owner && Number(role) === ROLES.ADMIN) {
    filter.owner = query.owner
  }
  if (query.from || query.to) {
    filter.weekStart = {}
    if (query.from) filter.weekStart.$gte = new Date(query.from)
    if (query.to) filter.weekStart.$lte = new Date(query.to)
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i')
    filter.$or = [
      {project: searchRegex},
      {'tasks.name': searchRegex},
      {blockers: searchRegex},
      {achievements: searchRegex},
      {nextWeekTasks: searchRegex},
      {notes: searchRegex}
    ]
  }

  return Report.find(filter)
    .populate('owner', 'name email role')
    .populate('reviewedBy', 'name email')
    .sort({weekStart: -1, updatedAt: -1})
}

export const createReport = (ownerId, reportData) => {
  return Report.create({...reportData, owner: ownerId})
}

export const getReport = (user, reportId) => {
  const filter = Number(user.role) === ROLES.ADMIN ? {_id: reportId} : {_id: reportId, owner: user.id}
  return Report.findOne(filter)
    .populate('owner', 'name email role')
    .populate('reviewedBy', 'name email')
    .populate('versions.reviewedBy', 'name email')
}

export const updateReport = async (user, reportId, reportData) => {
  const report = await Report.findOne({_id: reportId, owner: user.id})
  if (!report) throw new ApiError(404, 'Report not found')
  if (!['Draft', 'Needs Correction'].includes(report.status)) {
    throw new ApiError(409, 'Only draft reports or reports needing correction can be edited')
  }

  Object.assign(report, reportData)
  return report.save()
}

export const submitReport = async (userId, reportId) => {
  const report = await Report.findOne({_id: reportId, owner: userId})
  if (!report) throw new ApiError(404, 'Report not found')
  if (!['Draft', 'Needs Correction'].includes(report.status)) {
    throw new ApiError(409, 'This report cannot be submitted in its current status')
  }

  const snapshot = {
    weekStart: report.weekStart,
    weekEnd: report.weekEnd,
    project: report.project,
    tasks: report.tasks?.map(t => (t.toObject ? t.toObject() : t)) || [],
    nextWeekTasks: report.nextWeekTasks,
    blockers: report.blockers,
    keyBlocker: report.keyBlocker,
    achievements: report.achievements,
    keyAchievement: report.keyAchievement,
    hours: report.hours?.toObject ? report.hours.toObject() : report.hours,
    notes: report.notes
  }

  const nextVersionNum = (report.versions?.length || 0) + 1
  report.versions.push({
    version: nextVersionNum,
    submittedAt: new Date(),
    reviewComment: '',
    status: 'Submitted',
    content: snapshot
  })

  report.status = 'Submitted'
  report.reviewComment = ''
  report.reviewedAt = null
  report.reviewedBy = null

  await report.save()
  return Report.findById(report._id).populate('owner', 'name email role').populate('reviewedBy', 'name email')
}

export const reviewReport = async (reviewerId, reportId, {action, comment}) => {
  const report = await Report.findById(reportId)
  if (!report) throw new ApiError(404, 'Report not found')
  if (report.status !== 'Submitted') {
    throw new ApiError(409, 'Only submitted reports can be reviewed')
  }

  const newStatus = action === 'approve' ? 'Approved' : 'Needs Correction'
  const finalComment = action === 'approve' ? '' : (comment || '')
  const reviewedAt = new Date()

  report.status = newStatus
  report.reviewComment = finalComment
  report.reviewedAt = reviewedAt
  report.reviewedBy = reviewerId

  if (report.versions && report.versions.length > 0) {
    const latestVersion = report.versions[report.versions.length - 1]
    latestVersion.status = newStatus
    latestVersion.reviewComment = finalComment
    latestVersion.reviewedAt = reviewedAt
    latestVersion.reviewedBy = reviewerId
  }

  await report.save()
  return Report.findById(report._id).populate('owner', 'name email role').populate('reviewedBy', 'name email')
}

export const deleteReport = (ownerId, reportId) => {
  return Report.findOneAndDelete({_id: reportId, owner: ownerId, status: 'Draft'})
}

export const dashboardMetrics = async () => {
  const {weekStart, weekEnd} = getWeekBounds()

  const allUsers = await User.find().select('name email role')
  const teamMembers = allUsers.filter(u => u.role === ROLES.MEMBER || !u.role)
  const totalMembers = teamMembers.length || allUsers.length || 1

  // Current week reports
  const currentWeekReports = await Report.find({
    weekStart: {$gte: weekStart, $lte: weekEnd}
  }).populate('owner', 'name email role').populate('reviewedBy', 'name email')

  // All reports for trend analysis
  const allReports = await Report.find().populate('owner', 'name email').populate('reviewedBy', 'name email').sort({weekStart: -1})

  const submitted = currentWeekReports.filter(r => ['Submitted', 'Approved'].includes(r.status)).length
  const approved = currentWeekReports.filter(r => r.status === 'Approved').length
  const drafts = currentWeekReports.filter(r => r.status === 'Draft').length
  const correction = currentWeekReports.filter(r => r.status === 'Needs Correction').length
  const blockers = currentWeekReports.filter(r => r.blockers?.trim() || r.keyBlocker).length

  // Track submission status per member for current week
  const memberReportsMap = {}
  currentWeekReports.forEach(r => {
    if (r.owner?._id) {
      memberReportsMap[String(r.owner._id)] = r
    }
  })

  let notStartedCount = 0
  const memberCompliance = (teamMembers.length > 0 ? teamMembers : allUsers).map(member => {
    const report = memberReportsMap[String(member._id)]
    const memberStatus = report ? report.status : 'Not started'
    if (memberStatus === 'Not started') notStartedCount++
    return {
      userId: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      status: memberStatus,
      reportId: report?._id || null,
      weekStart: report?.weekStart || null,
      project: report?.project || null,
      keyBlocker: report?.keyBlocker || false,
      keyAchievement: report?.keyAchievement || false
    }
  })

  const complianceRate = Math.round((submitted / totalMembers) * 100)

  const byStatus = currentWeekReports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const byProject = currentWeekReports.reduce((acc, r) => {
    const proj = r.project || 'Uncategorized'
    acc[proj] = (acc[proj] || 0) + (r.tasks?.length || 1)
    return acc
  }, {})

  const timeByType = currentWeekReports.reduce((acc, r) => {
    const h = r.hours?.toObject?.() || r.hours || {}
    Object.entries(h).forEach(([key, val]) => {
      acc[key] = (acc[key] || 0) + (Number(val) || 0)
    })
    return acc
  }, {development: 0, testing: 0, meetings: 0, documentation: 0, other: 0})

  // 4-Week Tasks Trend
  const trendMap = {}
  for (let i = 3; i >= 0; i--) {
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - (i * 7))
    const bounds = getWeekBounds(targetDate)
    const label = `${bounds.weekStart.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`
    trendMap[label] = {
      weekLabel: label,
      weekStart: bounds.weekStart,
      totalTasks: 0,
      completedTasks: 0,
      hoursSpent: 0,
      submittedReports: 0
    }
  }

  allReports.forEach(r => {
    if (!r.weekStart) return
    const rStart = new Date(r.weekStart)
    Object.values(trendMap).forEach(bucket => {
      const bStart = new Date(bucket.weekStart)
      const diffDays = Math.abs((rStart - bStart) / (1000 * 60 * 60 * 24))
      if (diffDays <= 4) {
        if (['Submitted', 'Approved'].includes(r.status)) {
          bucket.submittedReports++
        }
        if (r.tasks && Array.isArray(r.tasks)) {
          r.tasks.forEach(t => {
            bucket.totalTasks++
            if (t.status === 'Complete' || t.actualPercent === 100) {
              bucket.completedTasks++
            }
            bucket.hoursSpent += (Number(t.spentHours) || 0)
          })
        }
      }
    })
  })

  const tasksTrend = Object.values(trendMap)

  // Recent Activity Feed
  const recentActivity = []
  allReports.slice(0, 15).forEach(r => {
    if (r.reviewedAt && r.reviewedBy) {
      recentActivity.push({
        id: `rev-${r._id}-${r.reviewedAt.getTime()}`,
        type: r.status === 'Approved' ? 'approved' : 'correction_requested',
        title: r.status === 'Approved' ? 'Report Approved' : 'Changes Requested',
        description: r.status === 'Approved'
          ? `${r.reviewedBy.name || 'Manager'} approved ${r.owner?.name || 'Member'}'s report for ${r.project}`
          : `${r.reviewedBy.name || 'Manager'} requested corrections on ${r.owner?.name || 'Member'}'s report: "${r.reviewComment}"`,
        timestamp: r.reviewedAt,
        reportId: r._id,
        user: r.reviewedBy
      })
    }
    if (r.status === 'Submitted' || r.versions?.length > 0) {
      recentActivity.push({
        id: `sub-${r._id}-${r.updatedAt?.getTime() || 0}`,
        type: 'submitted',
        title: 'Report Submitted',
        description: `${r.owner?.name || 'Member'} submitted weekly report for ${r.project}`,
        timestamp: r.updatedAt,
        reportId: r._id,
        user: r.owner
      })
    }
  })

  recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return {
    total: currentWeekReports.length,
    submitted,
    approved,
    drafts,
    correction,
    blockers,
    notStartedCount,
    totalMembers,
    complianceRate,
    byStatus,
    byProject,
    timeByType,
    tasksTrend,
    memberCompliance,
    recentActivity: recentActivity.slice(0, 10)
  }
}

export const getTeamPulse = async (weekStartDate) => {
  const target = weekStartDate ? new Date(weekStartDate) : new Date()
  const {weekStart, weekEnd} = getWeekBounds(target)

  const reports = await Report.find({
    weekStart: {$gte: weekStart, $lte: weekEnd}
  }).populate('owner', 'name email role').sort({'owner.name': 1})

  return {
    weekStart,
    weekEnd,
    total: reports.length,
    reports: reports.map(r => ({
      _id: r._id,
      owner: r.owner,
      project: r.project,
      status: r.status,
      blockers: r.blockers,
      keyBlocker: r.keyBlocker,
      achievements: r.achievements,
      keyAchievement: r.keyAchievement,
      nextWeekTasks: r.nextWeekTasks,
      tasks: r.tasks,
      hours: r.hours
    }))
  }
}
