import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function usePlans(activeOnly = true) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['plans', staffUser?.gym_id, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('membership_plans')
        .select('*')
        .eq('gym_id', staffUser!.gym_id)
        .order('price', { ascending: true })

      if (activeOnly) query = query.eq('is_active', true)

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
  })
}

export type CreatePlanInput = {
  name: string
  category?: string
  duration_days: number
  price: number
  description?: string
  perks?: string[]
}

export function useCreatePlan() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePlanInput) => {
      const { data, error } = await supabase
        .from('membership_plans')
        .insert({
          ...input,
          gym_id: staffUser!.gym_id,
          perks: input.perks ?? [],
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useUpdatePlan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { error } = await supabase.from('membership_plans').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useTogglePlanStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('membership_plans')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plans'] }),
  })
}
