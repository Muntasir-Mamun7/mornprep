-- MoRNPrep Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  pin text not null,
  gender text,
  age_range text,
  activity_level text,
  diet_type text,
  allergies text[] default '{}',
  cooking_skill text,
  meals_per_day integer default 3,
  spice_preference text,
  budget text,
  has_pcos boolean default false,
  pcos_severity text,
  pcos_insulin_resistant boolean default false,
  pcos_inflammation boolean default false,
  created_at timestamp with time zone default now()
);

-- Meals table
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  date date not null default current_date,
  status text not null default 'planned' check (status in ('planned', 'cooked', 'eaten')),
  is_in_fridge boolean default false,
  guidance_rating text check (guidance_rating in ('good', 'okay', 'bad')),
  guidance_note text,
  created_at timestamp with time zone default now()
);

-- Recipes table
create table public.recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  ingredients text[] default '{}',
  steps text[] default '{}',
  cook_time_mins integer default 30,
  servings integer default 2,
  tags text[] default '{}',
  is_shared boolean default false,
  share_code text unique,
  created_at timestamp with time zone default now()
);

-- Water logs table
create table public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  amount_ml integer not null,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index idx_meals_user_date on public.meals(user_id, date);
create index idx_water_user_date on public.water_logs(user_id, date);
create index idx_recipes_user on public.recipes(user_id);
create index idx_recipes_share_code on public.recipes(share_code) where share_code is not null;

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.recipes enable row level security;
alter table public.water_logs enable row level security;

-- Allow all operations for now (since we use simple PIN auth, not Supabase Auth)
-- For 2-3 users this is fine. Tighten if scaling.
create policy "Allow all on profiles" on public.profiles for all using (true) with check (true);
create policy "Allow all on meals" on public.meals for all using (true) with check (true);
create policy "Allow all on recipes" on public.recipes for all using (true) with check (true);
create policy "Allow all on water_logs" on public.water_logs for all using (true) with check (true);
