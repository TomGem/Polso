-- Events Dashboard - Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- Projects table
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  api_key text unique not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz default now()
);

-- Events table
create table events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  channel text not null,
  title text not null,
  description text,
  tags text[] default '{}',
  metadata jsonb default '{}',
  icon text,
  importance text default 'normal' check (importance in ('low', 'normal', 'high', 'critical')),
  favorited boolean default false,
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_events_project_id on events(project_id);
create index idx_events_channel on events(channel);
create index idx_events_created_at on events(created_at desc);
create index idx_events_importance on events(importance);
create index idx_events_favorited on events(favorited);
create index idx_events_tags on events using gin(tags);

-- Enable Realtime on the events table
alter publication supabase_realtime add table events;

-- Row Level Security (optional, can be customized)
-- For now, allow all operations via service role key
alter table projects enable row level security;
alter table events enable row level security;

-- Allow read access via anon key (for the dashboard frontend)
create policy "Allow public read on projects" on projects
  for select using (true);

create policy "Allow public read on events" on events
  for select using (true);

-- Allow all operations via service role (used by API routes)
create policy "Allow service role full access on projects" on projects
  for all using (true);

create policy "Allow service role full access on events" on events
  for all using (true);
