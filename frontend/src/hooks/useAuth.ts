import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  loginUser,
  logoutUser,
  registerUser,
  clearError,
  clearRegistrationSuccess,
} from '../store/authSlice'
import type { RegisterPayload } from '../types/auth'

export function useAuth() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading, error, fieldErrors, registrationSuccess } =
    useAppSelector((state) => state.auth)

  const login = async (email: string, password: string): Promise<void> => {
    const result = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard')
    }
  }

  const register = async (formData: RegisterPayload): Promise<void> => {
    const result = await dispatch(registerUser(formData))
    if (registerUser.fulfilled.match(result)) {
      setTimeout(() => {
        dispatch(clearRegistrationSuccess())
        navigate('/login')
      }, 2000)
    }
  }

  const logout = async (): Promise<void> => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const clearErrors = (): void => {
    dispatch(clearError())
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    fieldErrors,
    registrationSuccess,
    login,
    register,
    logout,
    clearErrors,
  }
}