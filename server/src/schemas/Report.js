import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
)

export default mongoose.model('Report', reportSchema)
