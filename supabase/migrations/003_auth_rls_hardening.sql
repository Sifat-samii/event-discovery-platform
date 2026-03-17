-- Role + RLS hardening for MVP

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'organizer', 'admin'));

-- Performance indexes for combined browse filtering
CREATE INDEX IF NOT EXISTS idx_events_status_start_area_category
  ON public.events(status, start_date, area_id, category_id);
CREATE INDEX IF NOT EXISTS idx_events_status_subcategory_start
  ON public.events(status, subcategory_id, start_date);
CREATE INDEX IF NOT EXISTS idx_events_status_end_date
  ON public.events(status, end_date);

-- Replace baseline policies with role-aware rules
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Events are publicly readable" ON public.events;
CREATE POLICY "Public can read published events" ON public.events
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Organizers can read own events" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Organizers can create own non-published events" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND status IN ('draft', 'pending')
  );

CREATE POLICY "Organizers can update own non-published events" ON public.events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.organizers o
      WHERE o.id = events.organizer_id
        AND o.user_id = auth.uid()
    )
    AND status IN ('draft', 'pending')
  );

CREATE POLICY "Organizers can read own organizer profile" ON public.organizers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Organizers can create own organizer profile" ON public.organizers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update own organizer profile" ON public.organizers
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own saved events" ON public.saved_events;
CREATE POLICY "Users can manage own saved events" ON public.saved_events
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders" ON public.reminders
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create event reports" ON public.event_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can read own reports" ON public.event_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reports" ON public.event_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Query plan references for EXPLAIN analysis (run in Supabase SQL editor)
-- EXPLAIN ANALYZE
-- SELECT id, title
-- FROM public.events
-- WHERE status = 'published'
--   AND end_date >= now()
--   AND start_date >= now()
--   AND area_id = '<area-id>'
--   AND category_id = '<category-id>'
-- ORDER BY start_date ASC
-- LIMIT 20 OFFSET 0;
