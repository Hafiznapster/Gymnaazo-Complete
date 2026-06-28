import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { addDays, format } from 'date-fns'

export function useDashboardStats() {
  const { staffUser } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const week = format(addDays(new Date(), 7), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['dashboard', staffUser?.gym_id, today],
    queryFn: async () => {
      const gymId = staffUser!.gym_id

      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: todayCheckIns },
        { data: todayPayments },
        { count: expiringThisWeek },
        { count: expiredCount },
      ] = await Promise.all([
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .is('deleted_at', null),

        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .eq('status', 'active')
          .is('deleted_at', null),

        supabase
          .from('attendance_logs')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .gte('check_in_at', `${today}T00:00:00`),

        supabase
          .from('payments')
          .select('amount')
          .eq('gym_id', gymId)
          .eq('status', 'paid')
          .gte('paid_at', `${today}T00:00:00`),

        supabase
          .from('member_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .eq('status', 'active')
          .gte('end_date', today)
          .lte('end_date', week),

        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gymId)
          .eq('status', 'expired')
          .is('deleted_at', null),
      ])

      const revenueToday = (todayPayments ?? []).reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      )

      return {
        totalMembers: totalMembers ?? 0,
        activeMembers: activeMembers ?? 0,
        todayCheckIns: todayCheckIns ?? 0,
        revenueToday,
        expiringThisWeek: expiringThisWeek ?? 0,
        expiredCount: expiredCount ?? 0,
      }
    },
    enabled: !!staffUser?.gym_id,
    refetchInterval: 60_000,
  })
}
