import bcrypt from 'bcrypt'
import User from '../schemas/User.js'
import Report from '../schemas/Report.js'
import Project from '../schemas/Project.js'
import {ApiError} from '../utils/apiError.js'
import {ROLES} from '../constants/roles.js'

export const listUsers = async () => {
  const users = await User.find().select('-passwordHash').sort({role: 1, name: 1})
  const reportCounts = await Report.aggregate([
    {$group: {_id: '$owner', count: {$sum: 1}}}
  ])
  const countMap = Object.fromEntries(reportCounts.map(r => [String(r._id), r.count]))

  const projects = await Project.find()

  return users.map(user => {
    const userProjects = projects.filter(p => p.members?.some(m => String(m) === String(user._id)))
    return {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      reportsCount: countMap[String(user._id)] || 0,
      projects: userProjects.map(p => ({_id: p._id, name: p.name}))
    }
  })
}

export const getUserStats = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash')
  if (!user) throw new ApiError(404, 'User not found')

  const reports = await Report.find({owner: userId}).sort({weekStart: -1})
  const projects = await Project.find({members: userId})

  const totalReports = reports.length
  const approvedReports = reports.filter(r => r.status === 'Approved').length
  const submittedReports = reports.filter(r => r.status === 'Submitted').length
  const correctionReports = reports.filter(r => r.status === 'Needs Correction').length
  const draftReports = reports.filter(r => r.status === 'Draft').length

  let totalTasks = 0
  let completedTasks = 0
  let totalHours = 0
  let blockersCount = 0

  reports.forEach(r => {
    if (r.tasks && Array.isArray(r.tasks)) {
      r.tasks.forEach(t => {
        totalTasks++
        if (t.status === 'Complete' || t.actualPercent === 100) completedTasks++
      })
    }
    if (r.hours) {
      totalHours += (r.hours.development || 0) + (r.hours.testing || 0) + (r.hours.meetings || 0) + (r.hours.documentation || 0) + (r.hours.other || 0)
    }
    if (r.blockers && r.blockers.trim()) blockersCount++
  })

  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const complianceRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0

  return {
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    stats: {
      totalReports,
      approvedReports,
      submittedReports,
      correctionReports,
      draftReports,
      totalTasks,
      completedTasks,
      taskCompletionRate,
      totalHours,
      blockersCount,
      complianceRate
    },
    projects: projects.map(p => ({_id: p._id, name: p.name, description: p.description})),
    recentReports: reports.slice(0, 10)
  }
}

export const updateUser = async (userId, {name, email, role}) => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  if (name) user.name = name
  if (email && email !== user.email) {
    const existing = await User.findOne({email})
    if (existing) throw new ApiError(409, 'Email is already taken')
    user.email = email
  }
  if (role !== undefined) user.role = Number(role)

  await user.save()
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
}

export const deleteUser = async (userId, requestingUser) => {
  if (String(requestingUser.id) === String(userId)) {
    throw new ApiError(400, 'You cannot delete your own account')
  }

  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  await Report.deleteMany({owner: userId})
  await Project.updateMany({members: userId}, {$pull: {members: userId}})
  await User.findByIdAndDelete(userId)

  return {success: true}
}

export const changePassword = async (userId, {currentPassword, newPassword}) => {
  const user = await User.findById(userId).select('+passwordHash')
  if (!user) throw new ApiError(404, 'User not found')

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isMatch) throw new ApiError(400, 'Current password is incorrect')

  user.passwordHash = await bcrypt.hash(newPassword, 12)
  await user.save()

  return {success: true}
}
