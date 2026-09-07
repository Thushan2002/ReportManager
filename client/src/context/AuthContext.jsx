import { useState } from 'react'
import toast from 'react-hot-toast'
import client from '../api/client.js'
import { AuthContext } from './authContext.js'

const TOKEN_KEY = 'report-manager-token'
const USER_KEY = 'report-manager-user'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || 'null'))
  const [isLoading, setIsLoading] = useState(false)

  const authenticate = async (endpoint, credentials) => {
    setIsLoading(true)
    try {
      const { data } = await client.post(endpoint, credentials)
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.user))
      setUser(data.user)
      toast.success(endpoint.includes('register') ? 'Your workspace is ready.' : 'Welcome back.')
      return data
    } catch (error) {
      toast.error(error.response?.data?.message || 'We could not complete that request.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    toast.success('You have been signed out.')
  }

  return <AuthContext.Provider value={{ user, isLoading, login: (data) => authenticate('/auth/login', data), register: (data) => authenticate('/auth/register', data), logout }}>{children}</AuthContext.Provider>
}
