-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security — Gymnazo Phase 1
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION auth_staff_gym_id()
RETURNS uuid AS $$
  SELECT gym_id FROM staff_users
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_staff_role()
RETURNS text AS $$
  SELECT role FROM staff_users
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION auth_is_owner_or_manager()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_users
    WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('owner','manager')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- GYMS
-- ============================================================
CREATE POLICY "staff can view their gym"
  ON gyms FOR SELECT
  USING (id = auth_staff_gym_id());

CREATE POLICY "owner can update gym"
  ON gyms FOR UPDATE
  USING (id = auth_staff_gym_id() AND auth_staff_role() = 'owner');

-- ============================================================
-- STAFF_USERS
-- ============================================================
CREATE POLICY "staff can view their gym staff"
  ON staff_users FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "owner can manage staff"
  ON staff_users FOR ALL
  USING (gym_id = auth_staff_gym_id() AND auth_staff_role() = 'owner');

-- ============================================================
-- MEMBERS
-- ============================================================
CREATE POLICY "staff can view members"
  ON members FOR SELECT
  USING (gym_id = auth_staff_gym_id() AND deleted_at IS NULL);

CREATE POLICY "staff can insert members"
  ON members FOR INSERT
  WITH CHECK (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can update members"
  ON members FOR UPDATE
  USING (gym_id = auth_staff_gym_id());

-- ============================================================
-- MEMBERSHIP PLANS
-- ============================================================
CREATE POLICY "staff can view plans"
  ON membership_plans FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "owner or manager can manage plans"
  ON membership_plans FOR ALL
  USING (gym_id = auth_staff_gym_id() AND auth_is_owner_or_manager());

-- ============================================================
-- MEMBER SUBSCRIPTIONS
-- ============================================================
CREATE POLICY "staff can view subscriptions"
  ON member_subscriptions FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can insert subscriptions"
  ON member_subscriptions FOR INSERT
  WITH CHECK (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can update subscriptions"
  ON member_subscriptions FOR UPDATE
  USING (gym_id = auth_staff_gym_id());

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE POLICY "staff can view payments"
  ON payments FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can insert payments"
  ON payments FOR INSERT
  WITH CHECK (gym_id = auth_staff_gym_id());

CREATE POLICY "owner or manager can update payments"
  ON payments FOR UPDATE
  USING (gym_id = auth_staff_gym_id() AND auth_is_owner_or_manager());

-- ============================================================
-- ATTENDANCE LOGS
-- ============================================================
CREATE POLICY "staff can view attendance"
  ON attendance_logs FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can insert attendance"
  ON attendance_logs FOR INSERT
  WITH CHECK (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can update attendance"
  ON attendance_logs FOR UPDATE
  USING (gym_id = auth_staff_gym_id());

-- ============================================================
-- MEMBER NOTES
-- ============================================================
CREATE POLICY "staff can view notes"
  ON member_notes FOR SELECT
  USING (gym_id = auth_staff_gym_id());

CREATE POLICY "staff can insert notes"
  ON member_notes FOR INSERT
  WITH CHECK (gym_id = auth_staff_gym_id());
