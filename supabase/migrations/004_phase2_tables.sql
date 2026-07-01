-- ============================================================
-- 004_phase2_tables.sql
-- Phase 2: Body Measurements, PT Packages/Sessions,
--           Trainer–Member Assignments
-- Run in Supabase SQL Editor AFTER 003_seed_data.sql
-- ============================================================

-- ============================================================
-- BODY MEASUREMENTS
-- ============================================================
CREATE TABLE body_measurements (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  recorded_by     uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  recorded_at     date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg       numeric(5,2),
  height_cm       numeric(5,2),
  body_fat_pct    numeric(4,2),
  chest_cm        numeric(5,2),
  waist_cm        numeric(5,2),
  hips_cm         numeric(5,2),
  arms_cm         numeric(5,2),
  thighs_cm       numeric(5,2),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_body_measurements_member ON body_measurements(member_id, recorded_at DESC);

-- ============================================================
-- PT PACKAGES
-- ============================================================
CREATE TABLE pt_packages (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name            text NOT NULL,
  sessions_count  int NOT NULL DEFAULT 10,
  validity_days   int NOT NULL DEFAULT 60,
  price           numeric(10,2) NOT NULL,
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pt_packages_updated_at
  BEFORE UPDATE ON pt_packages FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ============================================================
-- PT ENROLLMENTS (member buys a PT package)
-- ============================================================
CREATE TABLE pt_enrollments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id      uuid NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
  package_id      uuid NOT NULL REFERENCES pt_packages(id),
  payment_id      uuid REFERENCES payments(id) ON DELETE SET NULL,
  sessions_total  int NOT NULL,
  sessions_used   int NOT NULL DEFAULT 0,
  start_date      date NOT NULL DEFAULT CURRENT_DATE,
  expires_at      date,
  status          text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','cancelled','expired')),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pt_enrollments_updated_at
  BEFORE UPDATE ON pt_enrollments FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

CREATE INDEX idx_pt_enrollments_member ON pt_enrollments(member_id);
CREATE INDEX idx_pt_enrollments_trainer ON pt_enrollments(trainer_id);

-- ============================================================
-- PT SESSIONS (individual session log)
-- ============================================================
CREATE TABLE pt_sessions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  enrollment_id   uuid NOT NULL REFERENCES pt_enrollments(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  trainer_id      uuid NOT NULL REFERENCES staff_users(id) ON DELETE RESTRICT,
  session_date    date NOT NULL DEFAULT CURRENT_DATE,
  session_time    time,
  duration_mins   int DEFAULT 60,
  status          text NOT NULL DEFAULT 'completed'
                  CHECK (status IN ('completed','no_show','cancelled')),
  notes           text,
  member_rating   int CHECK (member_rating BETWEEN 1 AND 5),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pt_sessions_enrollment ON pt_sessions(enrollment_id);
CREATE INDEX idx_pt_sessions_trainer ON pt_sessions(trainer_id, session_date DESC);

-- ============================================================
-- TRAINER–MEMBER ASSIGNMENTS
-- ============================================================
CREATE TABLE trainer_member_assignments (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  trainer_id      uuid NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  assigned_by     uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  assigned_at     timestamptz NOT NULL DEFAULT now(),
  is_active       boolean NOT NULL DEFAULT true,
  UNIQUE(gym_id, trainer_id, member_id)
);
