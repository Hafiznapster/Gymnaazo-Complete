export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberStatus = 'active' | 'expired' | 'frozen' | 'pending'
export type PaymentMethod = 'cash' | 'upi_manual' | 'razorpay_qr' | 'card' | 'bank_transfer' | 'cheque'
export type PaymentType = 'admission' | 'subscription' | 'pt' | 'other'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type StaffRole = 'owner' | 'manager' | 'receptionist' | 'trainer'
export type SubscriptionStatus = 'active' | 'expired' | 'frozen' | 'cancelled'

export interface Gym {
  id: string
  name: string
  slug: string
  logo_url: string | null
  address: string | null
  phone: string | null
  email: string | null
  gstin: string | null
  timezone: string
  currency: string
  business_hours: Json | null
  settings: Json | null
  created_at: string
  updated_at: string
}

export interface Member {
  id: string
  gym_id: string
  member_code: string
  name: string
  phone: string
  email: string | null
  dob: string | null
  gender: 'male' | 'female' | 'other' | null
  address: string | null
  emergency_contact: string | null
  blood_group: string | null
  medical_notes: string | null
  photo_url: string | null
  alt_phone: string | null
  id_proof_url: string | null
  tags: string[]
  source: string | null
  referral_by: string | null
  status: MemberStatus
  whatsapp_opted_out: boolean
  joined_at: string
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface MembershipPlan {
  id: string
  gym_id: string
  name: string
  category: string | null
  duration_days: number
  price: number
  description: string | null
  perks: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MemberSubscription {
  id: string
  gym_id: string
  member_id: string
  plan_id: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
  renewal_count: number
  frozen_days: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  gym_id: string
  member_id: string
  subscription_id: string | null
  amount: number
  type: PaymentType
  payment_method: PaymentMethod
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  razorpay_qr_id: string | null
  qr_image_url: string | null
  status: PaymentStatus
  expires_at: string | null
  receipt_no: string
  discount_amount: number
  discount_reason: string | null
  tax_amount: number
  notes: string | null
  recorded_by: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface AttendanceLog {
  id: string
  gym_id: string
  member_id: string
  check_in_at: string
  check_out_at: string | null
  recorded_by: string | null
  created_at: string
}

export interface StaffUser {
  id: string
  gym_id: string
  user_id: string
  name: string
  phone: string | null
  email: string
  role: StaffRole
  photo_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MemberNote {
  id: string
  gym_id: string
  member_id: string
  note: string
  created_by: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      gyms: {
        Row: Gym
        Insert: Omit<Gym, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Gym>
      }
      members: {
        Row: Member
        Insert: Omit<Member, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Member>
      }
      membership_plans: {
        Row: MembershipPlan
        Insert: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<MembershipPlan>
      }
      member_subscriptions: {
        Row: MemberSubscription
        Insert: Omit<MemberSubscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<MemberSubscription>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Payment>
      }
      attendance_logs: {
        Row: AttendanceLog
        Insert: Omit<AttendanceLog, 'id' | 'created_at'>
        Update: Partial<AttendanceLog>
      }
      staff_users: {
        Row: StaffUser
        Insert: Omit<StaffUser, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<StaffUser>
      }
      member_notes: {
        Row: MemberNote
        Insert: Omit<MemberNote, 'id' | 'created_at'>
        Update: Partial<MemberNote>
      }
      body_measurements: {
        Row: BodyMeasurement
        Insert: Omit<BodyMeasurement, 'id' | 'created_at'>
        Update: Partial<BodyMeasurement>
      }
      pt_packages: {
        Row: PTPackage
        Insert: Omit<PTPackage, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<PTPackage>
      }
      pt_enrollments: {
        Row: PTEnrollment
        Insert: Omit<PTEnrollment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<PTEnrollment>
      }
      pt_sessions: {
        Row: PTSession
        Insert: Omit<PTSession, 'id' | 'created_at'>
        Update: Partial<PTSession>
      }
      trainer_member_assignments: {
        Row: TrainerMemberAssignment
        Insert: Omit<TrainerMemberAssignment, 'id' | 'assigned_at'>
        Update: Partial<TrainerMemberAssignment>
      }
    }
  }
}

// ─── Phase 2 Types ────────────────────────────────────────────────────────────

export interface BodyMeasurement {
  id: string
  gym_id: string
  member_id: string
  recorded_by: string | null
  recorded_at: string
  weight_kg: number | null
  height_cm: number | null
  body_fat_pct: number | null
  chest_cm: number | null
  waist_cm: number | null
  hips_cm: number | null
  arms_cm: number | null
  thighs_cm: number | null
  notes: string | null
  created_at: string
}

export interface PTPackage {
  id: string
  gym_id: string
  name: string
  sessions_count: number
  validity_days: number
  price: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PTEnrollment {
  id: string
  gym_id: string
  member_id: string
  trainer_id: string
  package_id: string
  payment_id: string | null
  sessions_total: number
  sessions_used: number
  start_date: string
  expires_at: string | null
  status: 'active' | 'completed' | 'cancelled' | 'expired'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PTSession {
  id: string
  gym_id: string
  enrollment_id: string
  member_id: string
  trainer_id: string
  session_date: string
  session_time: string | null
  duration_mins: number | null
  status: 'completed' | 'no_show' | 'cancelled'
  notes: string | null
  member_rating: number | null
  created_at: string
}

export interface TrainerMemberAssignment {
  id: string
  gym_id: string
  trainer_id: string
  member_id: string
  assigned_by: string | null
  assigned_at: string
  is_active: boolean
}

