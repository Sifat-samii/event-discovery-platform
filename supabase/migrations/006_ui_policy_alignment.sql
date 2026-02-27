-- Align repository migrations with policy edits applied in Supabase UI.

-- Ensure RLS is enabled on all policy-managed tables.
ALTER TABLE public.app_migration_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tags_junction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Migration versions table policy is now admin-governed under RLS.
DROP POLICY IF EXISTS "Admins can manage migration versions" ON public.app_migration_versions;
CREATE POLICY "Admins can manage migration versions" ON public.app_migration_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Public lookup tables and tag mappings.
DROP POLICY IF EXISTS "Public can read event areas" ON public.event_areas;
CREATE POLICY "Public can read event areas" ON public.event_areas
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can read event categories" ON public.event_categories;
CREATE POLICY "Public can read event categories" ON public.event_categories
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "public can read subcategories" ON public.event_subcategories;
CREATE POLICY "public can read subcategories" ON public.event_subcategories
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "public can read tags" ON public.event_tags;
CREATE POLICY "public can read tags" ON public.event_tags
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can read event tag mappings" ON public.event_tags_junction;
CREATE POLICY "Public can read event tag mappings" ON public.event_tags_junction
  FOR SELECT
  TO public
  USING (true);

-- Event click tracking.
DROP POLICY IF EXISTS "Public can insert click" ON public.event_clicks;
CREATE POLICY "Public can insert click" ON public.event_clicks
  FOR INSERT
  TO public
  WITH CHECK (
    (user_id IS NULL OR user_id = auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.id = event_clicks.event_id
        AND e.status = 'published'
        AND e.deleted_at IS NULL
    )
  );

-- Events policies (soft-delete aware public reads + organizer ownership checks).
DROP POLICY IF EXISTS "Public can read published events" ON public.events;
DROP POLICY IF EXISTS "status = 'published' and deleted_at is null" ON public.events;
CREATE POLICY "status = 'published' and deleted_at is null" ON public.events
  FOR SELECT
  TO public
  USING (status = 'published' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Organizers can read own events" ON public.events;
CREATE POLICY "Organizers can read own events" ON public.events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

DROP POLICY IF EXISTS "Organizers can create own non-published events" ON public.events;
CREATE POLICY "Organizers can create own non-published events" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND organizer_id IS NOT NULL
    AND deleted_at IS NULL
    AND status = ANY (ARRAY['draft'::text, 'pending'::text])
  );

DROP POLICY IF EXISTS "Organizers can update own non-published events" ON public.events;
CREATE POLICY "Organizers can update own non-published events" ON public.events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND deleted_at IS NULL
    AND status = ANY (ARRAY['draft'::text, 'pending'::text])
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND deleted_at IS NULL
    AND status = ANY (ARRAY['draft'::text, 'pending'::text])
  );

-- Event reports policies.
DROP POLICY IF EXISTS "Users can create event reports" ON public.event_reports;
CREATE POLICY "Users can create event reports" ON public.event_reports
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can read own reports" ON public.event_reports;
CREATE POLICY "Users can read own reports" ON public.event_reports
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage reports" ON public.event_reports;
CREATE POLICY "Admins can manage reports" ON public.event_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Organizer profile policies.
DROP POLICY IF EXISTS "Organizers can create own organizer profile" ON public.organizers;
CREATE POLICY "Organizers can create own organizer profile" ON public.organizers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizers can read own organizer profile" ON public.organizers;
CREATE POLICY "Organizers can read own organizer profile" ON public.organizers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = organizers.id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can update own organizer profile" ON public.organizers;
CREATE POLICY "Organizers can update own organizer profile" ON public.organizers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Featured listings policies.
DROP POLICY IF EXISTS "Public can read featured listings" ON public.featured_listings;
CREATE POLICY "Public can read featured listings" ON public.featured_listings
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can manage featured listings" ON public.featured_listings;
CREATE POLICY "Admins can manage featured listings" ON public.featured_listings
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Organizer subscriptions policies.
DROP POLICY IF EXISTS "Organizers can read own subscription" ON public.organizer_subscriptions;
CREATE POLICY "Organizers can read own subscription" ON public.organizer_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = organizer_subscriptions.organizer_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizer can insert own subscription" ON public.organizer_subscriptions;
CREATE POLICY "Organizer can insert own subscription" ON public.organizer_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = organizer_subscriptions.organizer_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Organizers can update own subscription" ON public.organizer_subscriptions;
CREATE POLICY "Organizers can update own subscription" ON public.organizer_subscriptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = organizer_subscriptions.organizer_id
        AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = organizer_subscriptions.organizer_id
        AND o.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage organizer subscriptions" ON public.organizer_subscriptions;
CREATE POLICY "Admins can manage organizer subscriptions" ON public.organizer_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.id = auth.uid()
        AND u.role = 'admin'
    )
  );

-- Keep existing policies for reminders, saved_events, users in sync with UI definitions.
DROP POLICY IF EXISTS "Users can manage own reminders" ON public.reminders;
CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own saved events" ON public.saved_events;
CREATE POLICY "Users can manage own saved events" ON public.saved_events
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Record this policy-alignment migration if tracking table is populated later.
INSERT INTO public.app_migration_versions (version, description)
VALUES ('006', 'ui_policy_alignment')
ON CONFLICT (version) DO NOTHING;
