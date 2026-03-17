-- Fix infinite recursion in organizers SELECT policy.
-- Migration 006 introduced a self-referencing EXISTS subquery:
--   EXISTS(SELECT 1 FROM public.organizers o WHERE o.id = organizers.id ...)
-- This triggers the same SELECT policy again, causing infinite recursion.

-- Replace with a direct check (restoring the original intent from 003).
DROP POLICY IF EXISTS "Organizers can read own organizer profile" ON public.organizers;
CREATE POLICY "Organizers can read own organizer profile" ON public.organizers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Organizer profiles (name, verified, website) are public data shown on
-- event listings and detail pages. Without a public read policy, the
-- organizer:organizers(*) join returns null for unauthenticated visitors.
DROP POLICY IF EXISTS "Public can read organizer profiles" ON public.organizers;
CREATE POLICY "Public can read organizer profiles" ON public.organizers
  FOR SELECT
  TO public
  USING (true);

INSERT INTO public.app_migration_versions (version, description)
VALUES ('007', 'fix_organizer_policy_recursion')
ON CONFLICT (version) DO NOTHING;
