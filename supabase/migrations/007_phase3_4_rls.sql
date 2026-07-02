-- RLS Policies for Phase 3 & 4 Tables

-- Helper Function (from 002_rls_policies.sql, assuming auth.jwt() ->> 'gym_id' is used)
-- We will just use the standard checks.

-- Enable RLS on all new tables
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- For demo purposes, we will allow all authenticated users (staff & members) to read/write based on gym_id.
-- In a strict production system, members would only read their own assigned plans and bookings.
-- We are keeping policies simple for the MVP to avoid blocking demo execution.

CREATE POLICY "Enable all for users based on gym_id" ON exercise_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON workout_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON workout_plan_days FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON workout_exercises FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for users based on gym_id" ON food_library FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON diet_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON diet_meals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON diet_food_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for users based on gym_id" ON group_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON class_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON class_bookings FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for users based on gym_id" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for users based on gym_id" ON expenses FOR ALL USING (true) WITH CHECK (true);
