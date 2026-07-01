import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { BodyMeasurement } from '@/types/database'

// ─── Measurements for a member ────────────────────────────────────────────────
export function useMemberMeasurements(memberId: string) {
  return useQuery({
    queryKey: ['body-measurements', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('member_id', memberId)
        .order('recorded_at', { ascending: true })

      if (error) throw error
      return data as BodyMeasurement[]
    },
    enabled: !!memberId,
  })
}

// ─── Log new measurement ──────────────────────────────────────────────────────
export function useLogMeasurement() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async (
      input: Omit<BodyMeasurement, 'id' | 'created_at' | 'gym_id' | 'recorded_by'>
    ) => {
      const { data, error } = await supabase
        .from('body_measurements')
        .insert({
          gym_id: staffUser!.gym_id,
          recorded_by: staffUser!.id,
          ...input,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['body-measurements', vars.member_id] })
    },
  })
}

// ─── Delete measurement ───────────────────────────────────────────────────────
export function useDeleteMeasurement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, memberId }: { id: string; memberId: string }) => {
      const { error } = await supabase.from('body_measurements').delete().eq('id', id)
      if (error) throw error
      return memberId
    },
    onSuccess: (memberId) => {
      queryClient.invalidateQueries({ queryKey: ['body-measurements', memberId] })
    },
  })
}
