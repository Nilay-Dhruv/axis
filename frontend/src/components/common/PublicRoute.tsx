import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function PublicRoute({ children }: Props) {
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}