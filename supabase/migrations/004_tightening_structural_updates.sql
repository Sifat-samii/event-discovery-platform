-- Structural tightening migration

-- Soft delete columns
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.saved_events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organizer_events'
  ) THEN
    EXECUTE 'ALTER TABLE public.organizer_events ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE';
  END IF;
END $$;

-- Reminder lifecycle tracking
ALTER TABLE public.reminders
  ADD COLUMN IF NOT EXISTS status_24h TEXT NOT NULL DEFAULT 'pending'
    CHECK (status_24h IN ('pending', 'sent', 'failed')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed')),
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Asia/Dhaka',
  ADD COLUMN IF NOT EXISTS reminder_type TEXT NOT NULL DEFAULT 'combined',
  ADD COLUMN IF NOT EXISTS status_3h TEXT NOT NULL DEFAULT 'pending'
    CHECK (status_3h IN ('pending', 'sent', 'failed'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_status') THEN
    CREATE TYPE public.reminder_status AS ENUM ('pending', 'sent', 'failed');
  END IF;
END $$;

ALTER TABLE public.reminders
  ALTER COLUMN status TYPE public.reminder_status
  USING (
    CASE
      WHEN status IN ('pending', 'sent', 'failed') THEN status::public.reminder_status
      ELSE 'pending'::public.reminder_status
    END
  ),
  ALTER COLUMN status SET DEFAULT 'pending';

-- Case-insensitive slug uniqueness guard
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug_unique_lower
  ON public.events (LOWER(slug));
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug_unique
  ON public.events (slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_events_user_event_unique
  ON public.saved_events (user_id, event_id);

-- Pagination support and soft-delete-aware indexes
CREATE INDEX IF NOT EXISTS idx_events_published_active_pagination
  ON public.events (status, end_date, start_date, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_status
  ON public.events (status);
CREATE INDEX IF NOT EXISTS idx_events_start_date
  ON public.events (start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date
  ON public.events (end_date);
CREATE INDEX IF NOT EXISTS idx_events_category_id
  ON public.events (category_id);
CREATE INDEX IF NOT EXISTS idx_events_area_id
  ON public.events (area_id);
CREATE INDEX IF NOT EXISTS idx_events_slug
  ON public.events (slug);

CREATE INDEX IF NOT EXISTS idx_saved_events_user_active
  ON public.saved_events (user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_saved_events_user
  ON public.saved_events (user_id);

CREATE INDEX IF NOT EXISTS idx_reminders_user_active
  ON public.reminders (user_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reminders_user_status
  ON public.reminders (user_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reminders_user_event_type_active
  ON public.reminders (user_id, event_id, reminder_type)
  WHERE deleted_at IS NULL;

