-- Phase 3 & 4 Tables: Workouts, Diets, Classes, CRM, Finance

-- EXERCISE LIBRARY
CREATE TABLE exercise_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL,
    equipment TEXT,
    instructions TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- WORKOUT PLANS
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trainer_id UUID NOT NULL REFERENCES staff_users(id),
    member_id UUID REFERENCES members(id), -- If assigned to a specific member
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE workout_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_name TEXT NOT NULL, -- e.g., "Day 1 - Push", "Monday"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES workout_plan_days(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercise_library(id),
    sets INTEGER NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10-12', -- Text because could be "failure" or "10-12"
    rest_time_sec INTEGER DEFAULT 60,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FOOD LIBRARY
CREATE TABLE food_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    calories_per_100g NUMERIC NOT NULL,
    protein_per_100g NUMERIC NOT NULL,
    carbs_per_100g NUMERIC NOT NULL,
    fats_per_100g NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'g',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- DIET PLANS
CREATE TABLE diet_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    member_id UUID REFERENCES members(id),
    trainer_id UUID NOT NULL REFERENCES staff_users(id),
    target_calories NUMERIC,
    target_protein NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE diet_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
    meal_time TEXT NOT NULL, -- e.g. "Breakfast", "Pre-workout"
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE diet_food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES diet_meals(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES food_library(id),
    quantity NUMERIC NOT NULL, -- Multiplier for per_100g macros
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GROUP CLASSES
CREATE TABLE group_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_mins INTEGER NOT NULL DEFAULT 60,
    max_capacity INTEGER NOT NULL DEFAULT 20,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES group_classes(id),
    trainer_id UUID NOT NULL REFERENCES staff_users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE class_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES class_schedules(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id),
    status TEXT NOT NULL DEFAULT 'booked', -- booked, cancelled, attended
    booked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM: LEADS
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    source TEXT, -- walk-in, instagram, referral
    status TEXT NOT NULL DEFAULT 'new', -- new, contacted, trial_scheduled, trial_completed, converted, lost
    assigned_to UUID REFERENCES staff_users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- FINANCE: EXPENSES
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Rent, Utilities, Salaries, Marketing, Equipment, Misc
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES expense_categories(id),
    amount NUMERIC NOT NULL,
    expense_date DATE NOT NULL,
    notes TEXT,
    logged_by UUID NOT NULL REFERENCES staff_users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_workout_plans_member ON workout_plans(member_id);
CREATE INDEX idx_diet_plans_member ON diet_plans(member_id);
CREATE INDEX idx_class_schedules_start ON class_schedules(start_time);
CREATE INDEX idx_class_bookings_member ON class_bookings(member_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
