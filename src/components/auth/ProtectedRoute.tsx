import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import type { StaffRole } from '@/types/database'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: StaffRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, staffUser, isLoading } = useAuthStore()

  if (isLoading) return <LoadingScreen />
  if (!user || !staffUser) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(staffUser.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
