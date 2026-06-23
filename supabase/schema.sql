-- Run this in Supabase SQL Editor to update for Auth support

-- Drop old tables
DROP TABLE IF EXISTS public.water_logs CASCADE;
DROP TABLE IF EXISTS public.meals CASCADE;
DROP TABLE IF EXISTS public.recipes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles table (now linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
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
  id uuid default gen_random_uuid() primary key,
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
  id uuid default gen_random_uuid() primary key,
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
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  date date not null default current_date,
  amount_ml integer not null,
  created_at timestamp with time zone default now()
);

-- Indexes
create index idx_meals_user_date on public.meals(user_id, date);
create index idx_water_user_date on public.water_logs(user_id, date);
create index idx_recipes_user on public.recipes(user_id);
create index idx_recipes_share_code on public.recipes(share_code) where share_code is not null;

-- RLS
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.recipes enable row level security;
alter table public.water_logs enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Users can manage own meals" on public.meals for all using (auth.uid() = user_id);
create policy "Users can manage own recipes" on public.recipes for all using (auth.uid() = user_id);
create policy "Users can view shared recipes" on public.recipes for select using (is_shared = true);
create policy "Users can manage own water logs" on public.water_logs for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
