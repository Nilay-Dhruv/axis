import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../services/authService'
import type { AuthState, User, RegisterPayload } from '../types/auth'
import type { AxiosError } from 'axios'

// ─── Async Thunks ──────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await authService.login(email, password)
      const meData = await authService.getMe()
      const user = meData.data.user
      authService.storeUser(user)
      return user
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>
      return rejectWithValue(
        error.response?.data?.error?.message ?? 'Login failed. Please try again.'
      )
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData: RegisterPayload, { rejectWithValue }) => {
    try {
      const data = await authService.register(formData)
      return data.data.user
    } catch (err) {
      const error = err as AxiosError<{
        error: { message: string; details?: Record<string, string[]> }
      }>
      return rejectWithValue({
        message: error.response?.data?.error?.message ?? 'Registration failed.',
        details: error.response?.data?.error?.details,
      })
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout()
    } catch {
      return rejectWithValue('Logout failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getMe()
      return data.data.user
    } catch {
      return rejectWithValue('Session expired')
    }
  }
)

// ─── Initial State ─────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: authService.getStoredUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,
  fieldErrors: null,
  registrationSuccess: false,
}

// ─── Slice ─────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
      state.fieldErrors = null
    },
    clearRegistrationSuccess(state) {
      state.registrationSuccess = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload as User
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) ?? 'Login failed'
        state.isAuthenticated = false
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.fieldErrors = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false
        state.registrationSuccess = true
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload as
          | { message: string; details?: Record<string, string[]> }
          | undefined
        state.error = payload?.message ?? 'Registration failed'
        state.fieldErrors = payload?.details ?? null
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload as User
        state.isAuthenticated = true
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, clearRegistrationSuccess } = authSlice.actions
export default authSlice.reducer