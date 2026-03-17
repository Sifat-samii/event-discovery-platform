# Release Checklist (MVP)

Run the following commands before any release candidate push:

1. `npm run build`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test`
5. `npm run db:check`
6. `npm run seed:check`

## Manual Validation

- Browse page: combine category + subcategory + area + date range + time slot + pagination.
- Event detail: save, share, ICS download, report submission, similar events visible.
- Auth route security: anonymous user blocked from `/dashboard`, `/organizer`, `/admin`.
- Role checks: user cannot access admin APIs; organizer cannot self-publish.
- Reminder dispatch dry-run through `/api/reminders/dispatch` with `CRON_SECRET`.

## SQL / Query Validation

- Run EXPLAIN ANALYZE query block from `supabase/migrations/003_auth_rls_hardening.sql`.
- Confirm indexes are used and no full table scans on browse query.

## Deployment Notes

- Ensure production env vars are configured:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (if needed for jobs)
  - `CRON_SECRET`
