import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { StaffUser, Gym } from '@/types/database'

interface AuthState {
  user: User | null
  session: Session | null
  staffUser: StaffUser | null
  gym: Gym | null
  isLoading: boolean
  setAuth: (user: User | null, session: Session | null) => void
  setStaffUser: (staffUser: StaffUser | null) => void
  setGym: (gym: Gym | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      staffUser: null,
      gym: null,
      isLoading: true,
      setAuth: (user, session) => set({ user, session }),
      setStaffUser: (staffUser) => set({ staffUser }),
      setGym: (gym) => set({ gym }),
      setLoading: (isLoading) => set({ isLoading }),
      clear: () => set({ user: null, session: null, staffUser: null, gym: null }),
    }),
    {
      name: 'gymnazo-auth',
      partialize: (state) => ({
        staffUser: state.staffUser,
        gym: state.gym,
      }),
    },
  ),
)
