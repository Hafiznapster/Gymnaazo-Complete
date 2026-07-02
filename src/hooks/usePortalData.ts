import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function usePortalData() {
  const { memberUser } = useAuthStore()

  return useQuery({
    queryKey: ['portalData', memberUser?.id],
    queryFn: async () => {
      if (!memberUser) return null

      // Fetch active subscription
      const { data: subs, error: subErr } = await supabase
        .from('member_subscriptions')
        .select(`
          *,
          membership_plans (name, description, duration_days)
        `)
        .eq('member_id', memberUser.id)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)

      // Fetch recent attendance
      const { data: attendance, error: attErr } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('member_id', memberUser.id)
        .order('check_in_time', { ascending: false })
        .limit(5)

      // Fetch active PT enrollment
      const { data: pt, error: ptErr } = await supabase
        .from('pt_enrollments')
        .select(`
          *,
          pt_packages (name),
          staff_users (name)
        `)
        .eq('member_id', memberUser.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      if (subErr) throw subErr

      return {
        activeSubscription: subs?.[0] || null,
        recentAttendance: attendance || [],
        activePT: pt?.[0] || null
      }
    },
    enabled: !!memberUser?.id
  })
}
