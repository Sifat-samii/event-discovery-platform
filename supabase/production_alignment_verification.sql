-- Production alignment verification pack
-- Run this in Supabase SQL Editor against the target project.

-- 1) Applied migration versions
select version, description, applied_at
from public.app_migration_versions
order by version;

-- 2) Required structural columns
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'users' and column_name in ('role')) or
    (table_name = 'events' and column_name in ('deleted_at', 'status', 'start_date', 'end_date')) or
    (table_name = 'saved_events' and column_name in ('deleted_at')) or
    (table_name = 'reminders' and column_name in ('deleted_at', 'status_24h', 'status_3h', 'status', 'timezone', 'reminder_type')) or
    (table_name = 'event_reports' and column_name in ('status'))
  )
order by table_name, column_name;

-- 3) Required indexes from hardening migrations
select schemaname, tablename, indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'idx_events_status_start_area_category',
    'idx_events_status_subcategory_start',
    'idx_events_status_end_date',
    'idx_events_published_active_pagination',
    'idx_events_slug_unique_lower',
    'idx_saved_events_user_active',
    'idx_reminders_user_active',
    'idx_reminders_user_status',
    'idx_reminders_user_event_type_active'
  )
order by tablename, indexname;

-- 4) RLS enabled tables
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'app_migration_versions',
    'users',
    'organizers',
    'events',
    'saved_events',
    'reminders',
    'event_reports',
    'event_clicks',
    'event_categories',
    'event_subcategories',
    'event_areas',
    'event_tags',
    'event_tags_junction',
    'featured_listings',
    'organizer_subscriptions'
  )
order by tablename;

-- 5) Effective policies
select schemaname, tablename, policyname, permissive, cmd
from pg_policies
where schemaname = 'public'
  and tablename in (
    'app_migration_versions',
    'users',
    'organizers',
    'events',
    'saved_events',
    'reminders',
    'event_reports',
    'event_clicks',
    'event_categories',
    'event_subcategories',
    'event_areas',
    'event_tags',
    'event_tags_junction',
    'featured_listings',
    'organizer_subscriptions'
  )
order by tablename, policyname;
