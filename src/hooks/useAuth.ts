import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuthInit() {
  const { setAuth, setStaffUser, setGym, setLoading, clear } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuth(session.user, session)
        fetchStaffProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuth(session.user, session)
          await fetchStaffProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          clear()
          setLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchStaffProfile(userId: string) {
    setLoading(true)
    const { data: staffUser, error } = await supabase
      .from('staff_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !staffUser) {
      clear()
      setLoading(false)
      return
    }

    setStaffUser(staffUser)

    const { data: gym } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', staffUser.gym_id)
      .single()

    setGym(gym)
    setLoading(false)
  }
}

export function useLogin() {
  const navigate = useNavigate()

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return { login, logout }
}
