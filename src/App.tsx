import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingScreen } from '@/components/shared/LoadingScreen'
import { useAuthInit } from '@/hooks/useAuth'
import LoginPage from '@/pages/auth/LoginPage'

// ─── Phase 1 Pages ────────────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'))
const MembersPage = lazy(() => import('@/pages/members/MembersPage'))
const MemberDetailPage = lazy(() => import('@/pages/members/MemberDetailPage'))
const RegisterMemberPage = lazy(() => import('@/pages/members/RegisterMemberPage'))
const PlansPage = lazy(() => import('@/pages/plans/PlansPage'))
const PaymentsPage = lazy(() => import('@/pages/payments/PaymentsPage'))
const RecordPaymentPage = lazy(() => import('@/pages/payments/RecordPaymentPage'))
const AttendancePage = lazy(() => import('@/pages/attendance/AttendancePage'))
const ExpiryPage = lazy(() => import('@/pages/expiry/ExpiryPage'))

// ─── Phase 2 Pages — Frontend ─────────────────────────────────────────────────
const AnalyticsPage = lazy(() => import('@/pages/analytics/AnalyticsPage'))
const StaffPage = lazy(() => import('@/pages/staff/StaffPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))
const BodyMeasurementsPage = lazy(() => import('@/pages/body/BodyMeasurementsPage'))
const PTSessionsPage = lazy(() => import('@/pages/pt/PTSessionsPage'))

// ─── Phase 2 Pages — Integration Stubs (pending API keys) ────────────────────
const WhatsAppPage = lazy(() => import('@/pages/integrations/WhatsAppPage'))
const RazorpayPage = lazy(() => import('@/pages/integrations/RazorpayPage'))

export default function App() {
  useAuthInit()

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          {/* Phase 1 */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/register" element={<RegisterMemberPage />} />
          <Route path="members/:id" element={<MemberDetailPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/record" element={<RecordPaymentPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="expiry" element={<ExpiryPage />} />
          {/* Phase 2 — Frontend */}
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="members/:memberId/body" element={<BodyMeasurementsPage />} />
          <Route path="pt" element={<PTSessionsPage />} />
          {/* Phase 2 — Pending Integrations */}
          <Route path="integrations/whatsapp" element={<WhatsAppPage />} />
          <Route path="integrations/razorpay" element={<RazorpayPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
