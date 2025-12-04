-- Silo Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Saved items table
create table if not exists saved_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text not null,
  storage_path text not null,
  category text not null default 'other',
  source_platform text,
  extracted_text text,
  user_note text,
  user_tags text[] default '{}',
  ai_confidence float,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security for saved_items
alter table saved_items enable row level security;

create policy "Users can view own items"
  on saved_items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on saved_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on saved_items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on saved_items for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_saved_items_user_category on saved_items(user_id, category);
create index if not exists idx_saved_items_user_created on saved_items(user_id, created_at desc);
create index if not exists idx_saved_items_extracted_text on saved_items using gin(to_tsvector('english', coalesce(extracted_text, '')));

-- User subscriptions table
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  plan text not null default 'free',
  saves_this_month int default 0,
  month_reset_date date default (date_trunc('month', now()) + interval '1 month')::date,
  stripe_customer_id text,
  stripe_subscription_id text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security for subscriptions
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own subscription"
  on subscriptions for update
  using (auth.uid() = user_id);

-- Function to reset monthly saves (called by trigger)
create or replace function reset_monthly_saves()
returns trigger as $$
begin
  if NEW.month_reset_date <= current_date then
    NEW.saves_this_month := 0;
    NEW.month_reset_date := (date_trunc('month', now()) + interval '1 month')::date;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to auto-reset monthly saves on access
drop trigger if exists check_monthly_reset on subscriptions;
create trigger check_monthly_reset
  before update on subscriptions
  for each row
  execute function reset_monthly_saves();

-- Function to increment save count and check limits
create or replace function increment_save_count(p_user_id uuid)
returns json as $$
declare
  v_sub subscriptions;
  v_limit int;
begin
  -- Get or create subscription
  select * into v_sub from subscriptions where user_id = p_user_id;

  if v_sub is null then
    insert into subscriptions (user_id) values (p_user_id)
    returning * into v_sub;
  end if;

  -- Check if we need to reset (handles the monthly reset)
  if v_sub.month_reset_date <= current_date then
    update subscriptions
    set saves_this_month = 1,
        month_reset_date = (date_trunc('month', now()) + interval '1 month')::date,
        updated_at = now()
    where user_id = p_user_id;
    return json_build_object('allowed', true, 'count', 1, 'plan', v_sub.plan);
  end if;

  -- Set limit based on plan
  v_limit := case when v_sub.plan = 'pro' then 999999 else 50 end;

  -- Check if at limit
  if v_sub.saves_this_month >= v_limit then
    return json_build_object('allowed', false, 'count', v_sub.saves_this_month, 'plan', v_sub.plan);
  end if;

  -- Increment count
  update subscriptions
  set saves_this_month = saves_this_month + 1,
      updated_at = now()
  where user_id = p_user_id;

  return json_build_object('allowed', true, 'count', v_sub.saves_this_month + 1, 'plan', v_sub.plan);
end;
$$ language plpgsql security definer;

-- Grant execute permission to authenticated users
grant execute on function increment_save_count(uuid) to authenticated;

-- Create storage bucket for saved items
-- Note: Run this in Supabase Storage settings or via the dashboard
-- The bucket should be named 'saved-items' with public access for reading

-- Storage policies (run in Supabase SQL editor with storage schema access):
-- insert into storage.buckets (id, name, public) values ('saved-items', 'saved-items', true);

-- create policy "Users can upload own images"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'saved-items'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "Users can update own images"
--   on storage.objects for update
--   using (
--     bucket_id = 'saved-items'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "Users can delete own images"
--   on storage.objects for delete
--   using (
--     bucket_id = 'saved-items'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );

-- create policy "Public can view images"
--   on storage.objects for select
--   using (bucket_id = 'saved-items');
