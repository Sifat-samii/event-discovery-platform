# Security Baseline

## CSRF strategy

This app uses a same-site architecture where browser clients call same-origin Next.js API routes.
Supabase auth session cookies are first-party and constrained by same-site behavior, and we do not expose cookie-authenticated cross-origin mutation routes.

Current protections:

- Sensitive mutation endpoints require authenticated users and role checks where applicable.
- Cron/admin routes require secret bearer headers and admin role validation.
- Baseline rate limiting is applied to sensitive routes.
- Input sanitization is applied to report text, search query params, and organizer submission payloads.

If cross-origin clients are introduced in the future, add explicit CSRF tokens for all cookie-authenticated mutation endpoints.
