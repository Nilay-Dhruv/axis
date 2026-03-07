import api from './api'
import type { User, ApiResponse, AuthTokens, RegisterPayload } from '../types/auth'

const authService = {

  async register(data: RegisterPayload): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', data)
    return response.data
  },

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await api.post<ApiResponse<AuthTokens>>('/auth/login', { email, password })
    const { access_token, refresh_token } = response.data.data
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('refresh_token', refresh_token)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me')
    return response.data
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user')
    return user ? (JSON.parse(user) as User) : null
  },

  storeUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  },
}

export default authService