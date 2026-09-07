import mongoose from 'mongoose'

const ADMIN_ROLE = 10
const EMPLOYEE_ROLE = 20

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: Number, enum: [ADMIN_ROLE, EMPLOYEE_ROLE], default: EMPLOYEE_ROLE },
    // 10 -> Admin, 20 -> Employee. New documents default to Employee.
    passwordHash: { type: String, required: true, select: false }
  },
  { timestamps: true }
)

userSchema.pre('save', async function assignBootstrapRole(next) {
  if (this.isNew) {
    const existingUserCount = await mongoose.model('User').countDocuments()
    this.role = existingUserCount === 0 ? ADMIN_ROLE : EMPLOYEE_ROLE
  }
  next()
})

export default mongoose.model('User', userSchema)