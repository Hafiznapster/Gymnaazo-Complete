import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

// ─── Monthly Revenue ──────────────────────────────────────────────────────────
export function useMonthlyRevenue(months = 6) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['analytics', 'monthly-revenue', staffUser?.gym_id, months],
    queryFn: async () => {
      const gymId = staffUser!.gym_id
      const results: { month: string; revenue: number }[] = []

      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = format(startOfMonth(date), 'yyyy-MM-dd')
        const end = format(endOfMonth(date), 'yyyy-MM-dd')
        const label = format(date, 'MMM yy')

        const { data } = await supabase
          .from('payments')
          .select('amount')
          .eq('gym_id', gymId)
          .eq('status', 'paid')
          .gte('paid_at', start)
          .lte('paid_at', end + 'T23:59:59')

        const revenue = (data ?? []).reduce((s, p) => s + Number(p.amount), 0)
        results.push({ month: label, revenue })
      }

      return results
    },
    enabled: !!staffUser?.gym_id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Monthly Member Growth ────────────────────────────────────────────────────
export function useMemberGrowth(months = 6) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['analytics', 'member-growth', staffUser?.gym_id, months],
    queryFn: async () => {
      const gymId = staffUser!.gym_id
      const results: { month: string; new_members: number; total: number }[] = []
      let runningTotal = 0

      // Get baseline count before window
      const windowStart = format(
        startOfMonth(subMonths(new Date(), months - 1)),
        'yyyy-MM-dd',
      )
      const { count: baseline } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('gym_id', gymId)
        .is('deleted_at', null)
        .lt('joined_at', windowStart)

      runningTotal = baseline ?? 0

      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const start = format(startOfMonth(date), 'yyyy-MM-dd')
        const end = format(endOfMonth(date), 'yyyy-MM-dd')
        const label = format(date, 'MMM yy')

        const { count: newMembers } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .is('deleted_at', null)
          .gte('joined_at', start)
          .lte('joined_at', end + 'T23:59:59')

        runningTotal += newMembers ?? 0
        results.push({ month: label, new_members: newMembers ?? 0, total: runningTotal })
      }

      return results
    },
    enabled: !!staffUser?.gym_id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Payment Method Breakdown ─────────────────────────────────────────────────
export function usePaymentMethodBreakdown() {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['analytics', 'payment-methods', staffUser?.gym_id],
    queryFn: async () => {
      const gymId = staffUser!.gym_id
      const thisMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('payments')
        .select('payment_method, amount')
        .eq('gym_id', gymId)
        .eq('status', 'paid')
        .gte('paid_at', thisMonth)

      const totals: Record<string, number> = {}
      for (const row of data ?? []) {
        totals[row.payment_method] = (totals[row.payment_method] ?? 0) + Number(row.amount)
      }

      return Object.entries(totals).map(([name, value]) => ({ name, value }))
    },
    enabled: !!staffUser?.gym_id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Revenue by Payment Type ──────────────────────────────────────────────────
export function useRevenueByType() {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['analytics', 'revenue-by-type', staffUser?.gym_id],
    queryFn: async () => {
      const gymId = staffUser!.gym_id
      const thisMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('payments')
        .select('type, amount')
        .eq('gym_id', gymId)
        .eq('status', 'paid')
        .gte('paid_at', thisMonth)

      const totals: Record<string, number> = {}
      for (const row of data ?? []) {
        totals[row.type] = (totals[row.type] ?? 0) + Number(row.amount)
      }

      return Object.entries(totals).map(([name, value]) => ({ name, value }))
    },
    enabled: !!staffUser?.gym_id,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Daily Attendance (last 30 days) ─────────────────────────────────────────
export function useDailyAttendance(days = 14) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['analytics', 'daily-attendance', staffUser?.gym_id, days],
    queryFn: async () => {
      const gymId = staffUser!.gym_id
      const start = format(subMonths(new Date(), 1), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('attendance_logs')
        .select('check_in_at')
        .eq('gym_id', gymId)
        .gte('check_in_at', start)
        .order('check_in_at')

      const daily: Record<string, number> = {}
      for (const row of data ?? []) {
        const day = format(new Date(row.check_in_at), 'MMM dd')
        daily[day] = (daily[day] ?? 0) + 1
      }

      return Object.entries(daily).map(([date, count]) => ({ date, count }))
    },
    enabled: !!staffUser?.gym_id,
    staleTime: 1000 * 60 * 3,
  })
}
