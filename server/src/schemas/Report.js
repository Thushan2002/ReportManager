import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  name: {type: String, trim: true, required: true},
  priority: {type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium'},
  plannedPercent: {type: Number, min: 0, max: 100, default: 0},
  actualPercent: {type: Number, min: 0, max: 100, default: 0},
  status: {type: String, enum: ['Not started', 'In progress', 'Complete', 'Blocked'], default: 'Not started'},
  plannedHours: {type: Number, min: 0, default: 0},
  spentHours: {type: Number, min: 0, default: 0},
  deliverable: {type: String, trim: true, default: ''}
}, {_id: true})

const versionSchema = new mongoose.Schema({
  version: {type: Number, required: true},
  submittedAt: {type: Date, required: true},
  reviewComment: {type: String, default: ''},
  content: {type: mongoose.Schema.Types.Mixed, required: true}
}, {_id: false})

const reportSchema = new mongoose.Schema(
  {
    weekStart: {type: Date, required: true},
    weekEnd: {type: Date, required: true},
    project: {type: String, trim: true, required: true},
    tasks: {type: [taskSchema], default: []},
    nextWeekTasks: {type: String, trim: true, default: ''},
    blockers: {type: String, trim: true, default: ''},
    keyBlocker: {type: Boolean, default: false},
    achievements: {type: String, trim: true, default: ''},
    keyAchievement: {type: Boolean, default: false},
    hours: {
      development: {type: Number, min: 0, default: 0},
      testing: {type: Number, min: 0, default: 0},
      meetings: {type: Number, min: 0, default: 0},
      documentation: {type: Number, min: 0, default: 0},
      other: {type: Number, min: 0, default: 0}
    },
    notes: {type: String, trim: true, default: ''},
    status: {type: String, enum: ['Draft', 'Submitted', 'Needs Correction', 'Approved'], default: 'Draft'},
    reviewComment: {type: String, trim: true, default: ''},
    reviewedAt: {type: Date, default: null},
    reviewedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null},
    versions: {type: [versionSchema], default: []},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  },
  {timestamps: true}
)

reportSchema.index({owner: 1, weekStart: -1})
reportSchema.index({status: 1, weekStart: -1})

export default mongoose.model('Report', reportSchema)
