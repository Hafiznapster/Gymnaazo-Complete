import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { PaymentMethod, PaymentType } from '@/types/database'

export function usePayments(memberId?: string) {
  const { staffUser } = useAuthStore()

  return useQuery({
    queryKey: ['payments', staffUser?.gym_id, memberId],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          members (name, member_code, phone)
        `)
        .eq('gym_id', staffUser!.gym_id)
        .order('created_at', { ascending: false })

      if (memberId) query = query.eq('member_id', memberId)

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    enabled: !!staffUser?.gym_id,
  })
}

export type RecordPaymentInput = {
  member_id: string
  subscription_id?: string
  amount: number
  type: PaymentType
  payment_method: PaymentMethod
  plan_name?: string
  discount_amount?: number
  discount_reason?: string
  notes?: string
}

export function useRecordPayment() {
  const { staffUser, gym } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: RecordPaymentInput) => {
      const receipt_no = `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`

      const { data, error } = await supabase
        .from('payments')
        .insert({
          gym_id: staffUser!.gym_id,
          member_id: input.member_id,
          subscription_id: input.subscription_id ?? null,
          amount: input.amount,
          type: input.type,
          payment_method: input.payment_method,
          status: 'paid',
          receipt_no,
          discount_amount: input.discount_amount ?? 0,
          discount_reason: input.discount_reason ?? null,
          tax_amount: 0,
          notes: input.notes ?? null,
          recorded_by: staffUser!.id,
          paid_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { payment: data, gym }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useTodayRevenue() {
  const { staffUser } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]

  return useQuery({
    queryKey: ['today-revenue', staffUser?.gym_id, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('gym_id', staffUser!.gym_id)
        .eq('status', 'paid')
        .gte('paid_at', `${today}T00:00:00`)
        .lte('paid_at', `${today}T23:59:59`)

      if (error) throw error
      return (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0)
    },
    enabled: !!staffUser?.gym_id,
  })
}
