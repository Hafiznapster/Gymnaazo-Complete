-- ============================================================
-- 005_phase2_rls.sql
-- RLS Policies for Phase 2 tables
-- ============================================================

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_member_assignments ENABLE ROW LEVEL SECURITY;

-- body_measurements
CREATE POLICY "staff can view measurements"
  ON body_measurements FOR SELECT USING (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can insert measurements"
  ON body_measurements FOR INSERT WITH CHECK (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can update measurements"
  ON body_measurements FOR UPDATE USING (gym_id = auth_staff_gym_id());

-- pt_packages
CREATE POLICY "staff can view pt packages"
  ON pt_packages FOR SELECT USING (gym_id = auth_staff_gym_id());
CREATE POLICY "owner or manager can manage pt packages"
  ON pt_packages FOR ALL USING (gym_id = auth_staff_gym_id() AND auth_is_owner_or_manager());

-- pt_enrollments
CREATE POLICY "staff can view enrollments"
  ON pt_enrollments FOR SELECT USING (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can insert enrollments"
  ON pt_enrollments FOR INSERT WITH CHECK (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can update enrollments"
  ON pt_enrollments FOR UPDATE USING (gym_id = auth_staff_gym_id());

-- pt_sessions
CREATE POLICY "staff can view sessions"
  ON pt_sessions FOR SELECT USING (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can insert sessions"
  ON pt_sessions FOR INSERT WITH CHECK (gym_id = auth_staff_gym_id());
CREATE POLICY "staff can update sessions"
  ON pt_sessions FOR UPDATE USING (gym_id = auth_staff_gym_id());

-- trainer_member_assignments
CREATE POLICY "staff can view assignments"
  ON trainer_member_assignments FOR SELECT USING (gym_id = auth_staff_gym_id());
CREATE POLICY "owner or manager can manage assignments"
  ON trainer_member_assignments FOR ALL USING (gym_id = auth_staff_gym_id() AND auth_is_owner_or_manager());
