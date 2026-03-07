import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '../services/authService.ts'

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

import api from '../services/api.ts'
const mockApi = api as unknown as { post: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> }

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('stores tokens on login', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { data: { access_token: 'fake-access', refresh_token: 'fake-refresh' } },
    })
    await authService.login('test@example.com', 'Password1')
    expect(localStorage.getItem('access_token')).toBe('fake-access')
    expect(localStorage.getItem('refresh_token')).toBe('fake-refresh')
  })

  it('clears tokens on logout', async () => {
    localStorage.setItem('access_token', 'token')
    mockApi.post.mockResolvedValueOnce({})
    await authService.logout()
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('isAuthenticated returns true when token exists', () => {
    localStorage.setItem('access_token', 'some-token')
    expect(authService.isAuthenticated()).toBe(true)
  })

  it('isAuthenticated returns false when no token', () => {
    expect(authService.isAuthenticated()).toBe(false)
  })
})