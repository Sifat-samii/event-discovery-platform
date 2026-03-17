-- Migration state tracking for release validation

CREATE TABLE IF NOT EXISTS public.app_migration_versions (
  version TEXT PRIMARY KEY,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.app_migration_versions DISABLE ROW LEVEL SECURITY;
GRANT SELECT ON TABLE public.app_migration_versions TO anon, authenticated, service_role;

INSERT INTO public.app_migration_versions (version, description)
VALUES
  ('001', 'initial_schema'),
  ('002', 'seed_data'),
  ('003', 'auth_rls_hardening'),
  ('004', 'tightening_structural_updates'),
  ('005', 'migration_state_tracking')
ON CONFLICT (version) DO NOTHING;

