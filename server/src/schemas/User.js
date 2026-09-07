import mongoose from 'mongoose'
import { ROLES } from '../constants/roles.js'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: Number, enum: Object.values(ROLES), default: ROLES.MEMBER },
    // 10 -> Admin, 20 -> Employee. New documents default to Employee.
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
)

userSchema.pre('save', async function assignBootstrapRole() {
  if (this.isNew) {
    const existingUserCount = await mongoose.model('User').countDocuments()
    if (existingUserCount === 0) this.role = ROLES.ADMIN
  }
})

export default mongoose.model('User', userSchema)