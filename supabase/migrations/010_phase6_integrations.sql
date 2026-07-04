-- ============================================================
-- 010_phase6_integrations.sql
-- Phase 6: API Configs for Integrations
-- ============================================================

CREATE TABLE integration_configs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  provider        text NOT NULL, -- 'razorpay', 'wati'
  api_key         text,
  api_secret      text,
  webhook_secret  text,
  is_active       boolean DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (gym_id, provider)
);

CREATE TRIGGER integration_configs_updated_at
  BEFORE UPDATE ON integration_configs FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_select" ON integration_configs FOR SELECT
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');
CREATE POLICY "integration_insert" ON integration_configs FOR INSERT
  WITH CHECK (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');
CREATE POLICY "integration_update" ON integration_configs FOR UPDATE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');
CREATE POLICY "integration_delete" ON integration_configs FOR DELETE
  USING (gym_id = (SELECT gym_id FROM staff_users WHERE user_id = auth.uid()) AND (SELECT role FROM staff_users WHERE user_id = auth.uid()) = 'owner');
