import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { generateMemberCode } from '@/utils/memberIdGenerator'

export interface MemberFilters {
  status?: string
  search?: string
}

export function useMembers(filters?: MemberFilters) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['members', staffUser?.gym_id, filters],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select(`
          *,
          member_subscriptions (
            id, start_date, end_date, status, plan_id,
            membership_plans (name, duration_days, price)
          )
        `)
        .eq('gym_id', staffUser!.gym_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }
      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,member_code.ilike.%${filters.search}%`,
        )
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useMember(id: string | undefined) {
  return useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_subscriptions (
            *,
            membership_plans (*)
          ),
          payments (
            id, amount, type, payment_method, status, receipt_no, paid_at, created_at, notes
          ),
          attendance_logs (id, check_in_at, check_out_at),
          member_notes (id, note, created_at)
        `)
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export type CreateMemberInput = {
  name: string
  phone: string
  email?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  emergency_contact?: string
  blood_group?: string
  medical_notes?: string
  alt_phone?: string
  source?: string
  tags?: string[]
}

export function useCreateMember() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMemberInput) => {
      const member_code = await generateMemberCode(staffUser!.gym_id)

      const { data, error } = await supabase
        .from('members')
        .insert({
          ...input,
          gym_id: staffUser!.gym_id,
          member_code,
          created_by: staffUser!.id,
          status: 'pending',
          tags: input.tags ?? [],
          whatsapp_opted_out: false,
          joined_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: unknown }) => {
      const { error } = await supabase.from('members').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', vars.id] })
    },
  })
}

export function useSoftDeleteMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .update({ deleted_at: new Date().toISOString(), status: 'expired' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useAddMemberNote() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ memberId, note }: { memberId: string; note: string }) => {
      const { error } = await supabase.from('member_notes').insert({
        gym_id: staffUser!.gym_id,
        member_id: memberId,
        note,
        created_by: staffUser!.id,
      })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['member', vars.memberId] })
    },
  })
}
