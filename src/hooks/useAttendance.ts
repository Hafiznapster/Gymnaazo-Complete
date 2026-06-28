import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useTodayAttendance() {
  const { staffUser } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['today-attendance', staffUser?.gym_id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          members (id, name, member_code, photo_url, status)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .gte('check_in_at', `${today}T00:00:00`)
        .order('check_in_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
    refetchInterval: 30_000, // every 30 seconds
  })
}

export function useCheckIn() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('status, name')
        .eq('id', memberId)
        .single()

      if (memberError) throw memberError

      if (member.status === 'expired') {
        throw new Error(`${member.name}'s subscription is expired. Please renew before check-in.`)
      }

      const { data, error } = await supabase
        .from('attendance_logs')
        .insert({
          gym_id: staffUser!.gym_id,
          member_id: memberId,
          recorded_by: staffUser!.id,
          check_in_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('attendance_logs')
        .update({ check_out_at: new Date().toISOString() })
        .eq('id', logId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-attendance'] })
    },
  })
}

export function useAttendanceHistory(memberId: string | undefined, limit = 30) {
  return useQuery({
    queryKey: ['attendance-history', memberId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('member_id', memberId!)
        .order('check_in_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data ?? []
    },
    enabled: !!memberId,
  })
}
