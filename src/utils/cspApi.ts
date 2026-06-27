import axios from 'axios'
import { triggerSessionExpired } from './sessionExpired'

const CSP_TOKEN_KEY = 'csp_access_token'

export const cspApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// CSP token only for wallet APIs
cspApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(CSP_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// An expired/invalid CSP token on wallet/passbook calls → session expired flow.
cspApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) triggerSessionExpired()
    return Promise.reject(error)
  }
)

export default cspApi