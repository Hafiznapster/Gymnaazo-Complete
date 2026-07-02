import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { PortalLayout } from '@/components/layout/PortalLayout'

export function PortalProtectedRoute() {
  const { memberUser, isLoading } = useAuthStore()

  if (isLoading) return <LoadingScreen />
  
  // If not a member, redirect to portal login
  if (!memberUser) return <Navigate to="/portal/login" replace />

  // Render PortalLayout and nested routes
  return <PortalLayout />
}
