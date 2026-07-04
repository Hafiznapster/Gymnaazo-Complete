-- ============================================================
-- 008_phase5_tables.sql
-- Phase 5: Equipment, Inventory, Feedback
-- ============================================================

-- ============================================================
-- EQUIPMENT REGISTER
-- ============================================================
CREATE TABLE equipment (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name            text NOT NULL,
  category        text NOT NULL, -- Cardio, Strength, Accessories, etc.
  brand           text,
  model           text,
  purchase_date   date,
  purchase_price  numeric(10,2),
  warranty_expiry date,
  status          text NOT NULL DEFAULT 'working', -- working, maintenance, out_of_order
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER equipment_updated_at
  BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ============================================================
-- EQUIPMENT MAINTENANCE LOGS
-- ============================================================
CREATE TABLE equipment_maintenance (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id    uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  cost            numeric(10,2) DEFAULT 0,
  provider        text,
  notes           text NOT NULL,
  logged_by       uuid REFERENCES staff_users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================
CREATE TABLE inventory_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name            text NOT NULL,
  category        text, -- Beverages, Supplements, Merchandise, Consumables
  sku             text,
  quantity        int NOT NULL DEFAULT 0,
  min_threshold   int NOT NULL DEFAULT 5, -- Alert when below this
  unit_cost       numeric(10,2) DEFAULT 0,
  selling_price   numeric(10,2) DEFAULT 0,
  is_for_sale     boolean DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER inventory_items_updated_at
  BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- ============================================================
-- FEEDBACK & RATINGS
-- ============================================================
CREATE TABLE feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id          uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id       uuid REFERENCES members(id) ON DELETE SET NULL, -- Can be anonymous
  rating          int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type   text NOT NULL DEFAULT 'general', -- general, pt_session, class, facility
  reference_id    uuid, -- e.g., pt_session_id if type is pt_session
  comments        text,
  is_anonymous    boolean DEFAULT false,
  status          text DEFAULT 'new', -- new, reviewed, resolved
  created_at      timestamptz NOT NULL DEFAULT now()
);
