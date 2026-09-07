import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: Number, enum: [10, 20, 30], default: 10 },
    // 10 -> draft , 20 -> published 30 -> archived 
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
)

export default mongoose.model('Report', reportSchema)
