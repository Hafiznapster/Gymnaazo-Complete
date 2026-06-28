-- ============================================================
-- 001_initial_schema.sql
-- Gymnazo Phase 1 Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- GYMS (tenant root)
-- ============================================================
CREATE TABLE gyms (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           text NOT NULL,
  slug           text UNIQUE NOT NULL,
  logo_url       text,
  address        text,
  phone          text,
  email          text,
  gstin          text,
  timezone       text NOT NULL DEFAULT 'Asia/Kolkata',
  currency       text NOT NULL DEFAULT 'INR',
  business_hours jsonb,
  settings       jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- STAFF USERS
-- ============================================================
CREATE TABLE staff_users (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id     uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  phone      text,
  email      text NOT NULL,
  role       text NOT NULL CHECK (role IN ('owner','manager','receptionist','trainer')),
  photo_url  text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(gym_id, user_id)
);

-- ============================================================
-- MEMBERS
-- ============================================================
CREATE TABLE members (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id            uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_code       text NOT NULL,
  name              text NOT NULL,
  phone             text NOT NULL,
  email             text,
  dob               date,
  gender            text CHECK (gender IN ('male','female','other')),
  address           text,
  emergency_contact text,
  blood_group       text,
  medical_notes     text,
  photo_url         text,
  alt_phone         text,
  id_proof_url      text,
  tags              text[] NOT NULL DEFAULT '{}',
  source            text,
  referral_by       uuid REFERENCES members(id) ON DELETE SET NULL,
  status            text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','frozen','pending')),
  whatsapp_opted_out boolean NOT NULL DEFAULT false,
  joined_at         timestamptz NOT NULL DEFAULT now(),
  created_by        uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz,
  UNIQUE(gym_id, member_code)
);

-- ============================================================
-- MEMBERSHIP PLANS
-- ============================================================
CREATE TABLE membership_plans (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id        uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name          text NOT NULL,
  category      text,
  duration_days int NOT NULL,
  price         numeric(10,2) NOT NULL,
  description   text,
  perks         text[] NOT NULL DEFAULT '{}',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBER SUBSCRIPTIONS
-- ============================================================
CREATE TABLE member_subscriptions (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id        uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  plan_id       uuid NOT NULL REFERENCES membership_plans(id),
  start_date    date NOT NULL,
  end_date      date NOT NULL,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','frozen','cancelled')),
  renewal_count int NOT NULL DEFAULT 0,
  frozen_days   int NOT NULL DEFAULT 0,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE payments (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id               uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id            uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  subscription_id      uuid REFERENCES member_subscriptions(id) ON DELETE SET NULL,
  amount               numeric(10,2) NOT NULL,
  type                 text NOT NULL CHECK (type IN ('admission','subscription','pt','other')),
  payment_method       text NOT NULL DEFAULT 'cash' CHECK (
                         payment_method IN ('cash','upi_manual','razorpay_qr','card','bank_transfer','cheque')
                       ),
  razorpay_order_id    text,
  razorpay_payment_id  text,
  razorpay_qr_id       text,
  qr_image_url         text,
  status               text NOT NULL DEFAULT 'paid' CHECK (status IN ('pending','paid','failed','expired')),
  expires_at           timestamptz,
  receipt_no           text NOT NULL,
  discount_amount      numeric(10,2) NOT NULL DEFAULT 0,
  discount_reason      text,
  tax_amount           numeric(10,2) NOT NULL DEFAULT 0,
  notes                text,
  recorded_by          uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  paid_at              timestamptz DEFAULT now(),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- ATTENDANCE LOGS
-- ============================================================
CREATE TABLE attendance_logs (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id        uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id     uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  check_in_at   timestamptz NOT NULL DEFAULT now(),
  check_out_at  timestamptz,
  recorded_by   uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBER NOTES
-- ============================================================
CREATE TABLE member_notes (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id      uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id   uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  note        text NOT NULL,
  created_by  uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gyms_updated_at
  BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER staff_users_updated_at
  BEFORE UPDATE ON staff_users FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON member_subscriptions FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_members_gym_status ON members(gym_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_members_gym_phone  ON members(gym_id, phone);
CREATE INDEX idx_subscriptions_member ON member_subscriptions(member_id);
CREATE INDEX idx_subscriptions_end_date ON member_subscriptions(gym_id, status, end_date);
CREATE INDEX idx_payments_member ON payments(member_id, created_at DESC);
CREATE INDEX idx_payments_paid_at ON payments(gym_id, paid_at DESC);
CREATE INDEX idx_attendance_gym_date ON attendance_logs(gym_id, check_in_at DESC);
CREATE INDEX idx_attendance_member ON attendance_logs(member_id, check_in_at DESC);
