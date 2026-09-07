import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {'Content-Type': 'application/json'},
  withCredentials: true
})

client.interceptors.request.use((config) => {
  return config
})

export default client