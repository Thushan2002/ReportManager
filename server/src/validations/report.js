import { ApiError } from '../utils/apiError.js'

export const validateReport = ({ title }) => {
  if (!title?.trim()) {
    throw new ApiError(400, 'Report title is required')
  }
}
