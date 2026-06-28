import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { addDays, format } from 'date-fns'

export function useExpiringSubscriptions(days = 30) {
  const { staffUser } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')
  const futureDate = format(addDays(new Date(), days), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['expiring-subscriptions', staffUser?.gym_id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_subscriptions')
        .select(`
          *,
          members (id, name, phone, member_code, status),
          membership_plans (name, price, duration_days)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .eq('status', 'active')
        .gte('end_date', today)
        .lte('end_date', futureDate)
        .order('end_date', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useExpiredSubscriptions() {
  const { staffUser } = useAuthStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['expired-subscriptions', staffUser?.gym_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_subscriptions')
        .select(`
          *,
          members (id, name, phone, member_code, status),
          membership_plans (name, price, duration_days)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .eq('status', 'active')
        .lt('end_date', today)
        .order('end_date', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
  })
}

export function useMemberSubscriptions(memberId: string | undefined) {
  return useQuery({
    queryKey: ['subscriptions', memberId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('member_subscriptions')
        .select('*, membership_plans (*)')
        .eq('member_id', memberId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!memberId,
  })
}

export type CreateSubscriptionInput = {
  member_id: string
  plan_id: string
  start_date: string
  duration_days: number
  notes?: string
}

export function useCreateSubscription() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSubscriptionInput) => {
      const end_date = format(
        addDays(new Date(input.start_date), input.duration_days),
        'yyyy-MM-dd',
      )

      // Close any existing active subscription first
      await supabase
        .from('member_subscriptions')
        .update({ status: 'cancelled' })
        .eq('member_id', input.member_id)
        .eq('status', 'active')

      const { data, error } = await supabase
        .from('member_subscriptions')
        .insert({
          gym_id: staffUser!.gym_id,
          member_id: input.member_id,
          plan_id: input.plan_id,
          start_date: input.start_date,
          end_date,
          status: 'active',
          notes: input.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error

      // Update member status to active
      await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', input.member_id)

      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', vars.member_id] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', vars.member_id] })
      queryClient.invalidateQueries({ queryKey: ['expiring-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['expired-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useRenewSubscription() {
  const { staffUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSubscriptionInput & { renewal_count?: number }) => {
      const end_date = format(
        addDays(new Date(input.start_date), input.duration_days),
        'yyyy-MM-dd',
      )

      // Close existing active/expired subscriptions
      await supabase
        .from('member_subscriptions')
        .update({ status: 'expired' })
        .eq('member_id', input.member_id)
        .in('status', ['active', 'expired'])

      const { data, error } = await supabase
        .from('member_subscriptions')
        .insert({
          gym_id: staffUser!.gym_id,
          member_id: input.member_id,
          plan_id: input.plan_id,
          start_date: input.start_date,
          end_date,
          status: 'active',
          renewal_count: (input.renewal_count ?? 0) + 1,
          notes: input.notes ?? null,
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('members').update({ status: 'active' }).eq('id', input.member_id)

      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['member', vars.member_id] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', vars.member_id] })
      queryClient.invalidateQueries({ queryKey: ['expiring-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['expired-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
