-- ============================================================
-- 009_phase5_rls.sql
-- RLS policies for Equipment, Inventory, Feedback
-- ============================================================

-- Equipment
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_select" ON equipment FOR SELECT
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()));
CREATE POLICY "equipment_insert" ON equipment FOR INSERT
  WITH CHECK (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager'));
CREATE POLICY "equipment_update" ON equipment FOR UPDATE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager'));
CREATE POLICY "equipment_delete" ON equipment FOR DELETE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');

-- Equipment Maintenance
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maintenance_select" ON equipment_maintenance FOR SELECT
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()));
CREATE POLICY "maintenance_insert" ON equipment_maintenance FOR INSERT
  WITH CHECK (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()));
CREATE POLICY "maintenance_update" ON equipment_maintenance FOR UPDATE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager'));
CREATE POLICY "maintenance_delete" ON equipment_maintenance FOR DELETE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');

-- Inventory Items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inventory_select" ON inventory_items FOR SELECT
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()));
CREATE POLICY "inventory_insert" ON inventory_items FOR INSERT
  WITH CHECK (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager', 'receptionist'));
CREATE POLICY "inventory_update" ON inventory_items FOR UPDATE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager', 'receptionist'));
CREATE POLICY "inventory_delete" ON inventory_items FOR DELETE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');

-- Feedback (Staff View)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feedback_select" ON feedback FOR SELECT
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()));
CREATE POLICY "feedback_update" ON feedback FOR UPDATE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) IN ('owner', 'manager'));
-- Note: Members would need a policy to insert feedback via Edge Function or anonymous authenticated proxy if using phone OTP, but for now we'll allow an anon role insert if RLS permits, or just rely on backend functions. Since we are doing MVP frontend, we skip strict anon member insert rules for now.
