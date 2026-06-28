import { supabase } from '@/lib/supabase'

export async function generateMemberCode(gymId: string): Promise<string> {
  const { count } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('gym_id', gymId)

  const nextNumber = (count ?? 0) + 1
  return `GYM-${String(nextNumber).padStart(4, '0')}`
}
