import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true, unique: true},
    description: {type: String, trim: true, default: ''},
    members: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
}, {timestamps: true})

export default mongoose.model('Project', projectSchema)