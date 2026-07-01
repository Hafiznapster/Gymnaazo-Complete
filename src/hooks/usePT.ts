import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addDays, format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { PTPackage, PTEnrollment, PTSession } from '@/types/database'

// ─── PT Packages ──────────────────────────────────────────────────────────────
export function usePTPackages() {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['pt-packages', staffUser?.gym_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pt_packages')
        .select('*')
        .eq('gym_id', staffUser!.gym_id)
        .order('price')

      if (error) throw error
      return data as PTPackage[]
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useCreatePTPackage() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async (input: {
      name: string
      sessions_count: number
      validity_days: number
      price: number
      description?: string
    }) => {
      const { data, error } = await supabase
        .from('pt_packages')
        .insert({ gym_id: staffUser!.gym_id, ...input })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-packages'] }),
  })
}

export function useUpdatePTPackage() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PTPackage> }) => {
      const { data, error } = await supabase
        .from('pt_packages')
        .update(updates)
        .eq('id', id)
        .eq('gym_id', staffUser!.gym_id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-packages'] }),
  })
}

// ─── PT Enrollments ───────────────────────────────────────────────────────────
export function usePTEnrollments(memberId?: string) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['pt-enrollments', staffUser?.gym_id, memberId],
    queryFn: async () => {
      let query = supabase
        .from('pt_enrollments')
        .select(`
          *,
          members:member_id(name, member_code),
          pt_packages:package_id(name, sessions_count),
          staff_users:trainer_id(name)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .order('created_at', { ascending: false })

      if (memberId) query = query.eq('member_id', memberId)

      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useEnrollMember() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async (input: {
      member_id: string
      trainer_id: string
      package_id: string
      sessions_total: number
      validity_days: number
      notes?: string
    }) => {
      const expires_at = format(addDays(new Date(), input.validity_days), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('pt_enrollments')
        .insert({
          gym_id: staffUser!.gym_id,
          member_id: input.member_id,
          trainer_id: input.trainer_id,
          package_id: input.package_id,
          sessions_total: input.sessions_total,
          expires_at,
          notes: input.notes,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pt-enrollments'] }),
  })
}

// ─── PT Sessions ──────────────────────────────────────────────────────────────
export function usePTSessions(enrollmentId?: string) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['pt-sessions', staffUser?.gym_id, enrollmentId],
    queryFn: async () => {
      let query = supabase
        .from('pt_sessions')
        .select(`
          *,
          members:member_id(name, member_code),
          staff_users:trainer_id(name)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .order('session_date', { ascending: false })

      if (enrollmentId) query = query.eq('enrollment_id', enrollmentId)

      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useLogPTSession() {
  const queryClient = useQueryClient()
  const { staffUser } = useAuthStore()

  return useMutation({
    mutationFn: async (input: {
      enrollment_id: string
      member_id: string
      trainer_id: string
      session_date: string
      duration_mins?: number
      status: PTSession['status']
      notes?: string
    }) => {
      // Insert session
      const { data: session, error: sessionErr } = await supabase
        .from('pt_sessions')
        .insert({ gym_id: staffUser!.gym_id, ...input })
        .select()
        .single()

      if (sessionErr) throw sessionErr

      // Increment sessions_used on the enrollment
      const { error: enrollErr } = await supabase.rpc('increment_pt_sessions_used', {
        enrollment_id: input.enrollment_id,
      })
      // If rpc not available, do it manually
      if (enrollErr) {
        await supabase
          .from('pt_enrollments')
          .update({ sessions_used: supabase.rpc('increment_pt_sessions_used' as never) })
          .eq('id', input.enrollment_id)
      }

      return session
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pt-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['pt-enrollments'] })
    },
  })
}
