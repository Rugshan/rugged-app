-- Personal Fitness & Intake Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Create entries table
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  type text not null,
  value numeric not null,
  unit text,
  notes text
);

-- Create quickadds table for user-configurable quick add buttons
create table quickadds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  type text not null,
  label text not null,
  amount numeric not null,
  unit text not null,
  sort_order integer default 0
);

-- Enable Row Level Security
alter table entries enable row level security;
alter table quickadds enable row level security;

-- Create RLS policies for entries
create policy "Users can view their own entries" 
  on entries for select using (auth.uid() = user_id);

create policy "Users can insert their own entries" 
  on entries for insert with check (auth.uid() = user_id);

create policy "Users can update their own entries" 
  on entries for update using (auth.uid() = user_id);

create policy "Users can delete their own entries" 
  on entries for delete using (auth.uid() = user_id);

-- Create RLS policies for quickadds
create policy "Users can view their own quickadds" 
  on quickadds for select using (auth.uid() = user_id);

create policy "Users can insert their own quickadds" 
  on quickadds for insert with check (auth.uid() = user_id);

create policy "Users can update their own quickadds" 
  on quickadds for update using (auth.uid() = user_id);

create policy "Users can delete their own quickadds" 
  on quickadds for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index idx_entries_user_id on entries(user_id);
create index idx_entries_created_at on entries(created_at);
create index idx_entries_type on entries(type);

create index idx_quickadds_user_id on quickadds(user_id);
create index idx_quickadds_type on quickadds(type);
create index idx_quickadds_sort_order on quickadds(sort_order);
