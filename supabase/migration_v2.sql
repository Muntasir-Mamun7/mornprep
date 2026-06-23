-- MoRNPrep v2 Migration
-- Run this in Supabase SQL Editor AFTER the initial schema

-- Extended profile fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_hours text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS water_goal_ml integer DEFAULT 2500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_goal text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS prep_time_preference text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kitchen_equipment text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS living_situation text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_schedule text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_cuisines text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS protein_preferences text[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS chronotype text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS snacking_habits text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS emotional_eating text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Theme/settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_primary_color text DEFAULT '#d4802a';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_accent_color text DEFAULT '#567a5b';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_mode text DEFAULT 'light';

-- Push notifications
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_subscription jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false;

-- Recipe image support
ALTER TABLE public.recipes ADD COLUMN IF NOT EXISTS image_url text;

-- Period tracker table
CREATE TABLE IF NOT EXISTS public.period_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  log_type text NOT NULL CHECK (log_type IN ('period_start', 'period_end', 'symptom', 'mood', 'daily')),
  flow_intensity text CHECK (flow_intensity IN ('light', 'medium', 'heavy')),
  symptoms text[] DEFAULT '{}',
  mood text CHECK (mood IN ('happy', 'sad', 'irritable', 'anxious', 'calm', 'neutral')),
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_period_logs_user_date ON public.period_logs(user_id, date);
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own period logs" ON public.period_logs FOR ALL USING (auth.uid() = user_id);
