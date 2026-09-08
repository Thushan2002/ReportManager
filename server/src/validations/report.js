import Joi from 'joi'

const taskFields = {
  name: Joi.string().trim().required(),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
  plannedPercent: Joi.number().min(0).max(100).required(),
  actualPercent: Joi.number().min(0).max(100).required(),
  status: Joi.string().valid('Not started', 'In progress', 'Complete', 'Blocked').required(),
  plannedHours: Joi.number().min(0).required(),
  spentHours: Joi.number().min(0).required(),
  deliverable: Joi.string().allow('')
}

const reportFields = {
  weekStart: Joi.date().required(),
  weekEnd: Joi.date().required(),
  project: Joi.string().trim().required(),
  tasks: Joi.array().items(Joi.object(taskFields)).default([]),
  nextWeekTasks: Joi.string().allow('').default(''),
  blockers: Joi.string().allow('').default(''),
  keyBlocker: Joi.boolean().default(false),
  achievements: Joi.string().allow('').default(''),
  keyAchievement: Joi.boolean().default(false),
  hours: Joi.object({
    development: Joi.number().min(0).default(0),
    testing: Joi.number().min(0).default(0),
    meetings: Joi.number().min(0).default(0),
    documentation: Joi.number().min(0).default(0),
    other: Joi.number().min(0).default(0)
  }).default(),
  notes: Joi.string().allow('').default('')
}

export const reportSchema = Joi.object(reportFields).required()

export const updateReportSchema = Joi.object({
  ...reportFields,
  _id: Joi.string().hex().length(24).optional().strip(),
  status: Joi.string().valid('Draft', 'Submitted', 'Needs Correction', 'Approved').optional().strip(),
  reviewComment: Joi.any().strip(),
  reviewedAt: Joi.any().strip(),
  reviewedBy: Joi.any().strip(),
  owner: Joi.any().strip(),
  versions: Joi.any().strip(),
  createdAt: Joi.any().strip(),
  updatedAt: Joi.any().strip(),
  __v: Joi.any().strip(),
  tasks: Joi.array().items(Joi.object({
    _id: Joi.string().hex().length(24).optional().strip(),
    ...taskFields
  })).default([])
}).required()

export const reviewSchema = Joi.object({
  action: Joi.string().valid('approve', 'request_changes').required(),
  comment: Joi.when('action', {is: 'request_changes', then: Joi.string().trim().min(1).required(), otherwise: Joi.string().allow('').default('')})
})
