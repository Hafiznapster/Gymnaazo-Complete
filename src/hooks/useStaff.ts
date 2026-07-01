import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { StaffUser } from '@/types/database'

// ─── Staff List ───────────────────────────────────────────────────────────────
export function useStaff() {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['staff', staffUser?.gym_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('gym_id', staffUser!.gym_id)
        .order('created_at')

      if (error) throw error
      return data as StaffUser[]
    },
    enabled: !!staffUser?.gym_id,
  })
}

// ─── Trainers only (for dropdowns) ───────────────────────────────────────────
export function useTrainers() {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['staff', 'trainers', staffUser?.gym_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .eq('gym_id', staffUser!.gym_id)
        .eq('role', 'trainer')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as StaffUser[]
    },
    enabled: !!staffUser?.gym_id,
  })
}

// ─── Create Staff ─────────────────────────────────────────────────────────────
export function useCreateStaff() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async (input: {
      name: string
      email: string
      phone?: string
      role: StaffUser['role']
      // NOTE: Requires the user to be created via Supabase Auth first.
      // This mutation links an existing auth user to the gym staff.
      user_id: string
    }) => {
      const { data, error } = await supabase
        .from('staff_users')
        .insert({
          gym_id: staffUser!.gym_id,
          ...input,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

// ─── Update Staff ─────────────────────────────────────────────────────────────
export function useUpdateStaff() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Pick<StaffUser, 'name' | 'phone' | 'role' | 'is_active'>>
    }) => {
      const { data, error } = await supabase
        .from('staff_users')
        .update(updates)
        .eq('id', id)
        .eq('gym_id', staffUser!.gym_id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}

// ─── Toggle Active / Deactivate ───────────────────────────────────────────────
export function useToggleStaffActive() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('staff_users')
        .update({ is_active })
        .eq('id', id)
        .eq('gym_id', staffUser!.gym_id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] })
    },
  })
}
