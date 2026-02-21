# Lighthouse Baseline (MVP)

Run context:

- Tool: `lighthouse` CLI (`12.8.2`)
- Mode: mobile emulation, headless Chrome
- Local URL base: `http://localhost:3000`
- Date: 2026-02-21

## Scores

| Route | Performance | Accessibility | Best Practices | SEO | Notes |
|---|---:|---:|---:|---:|---|
| `/home` | 50 | 100 | 96 | 100 | Report saved as `docs/lh-home.json` |
| `/browse` | 47 | 98 | 96 | 100 | Report saved as `docs/lh-browse.json` |
| `/events/[slug]` | Blocked | - | - | - | No published event slug available in local dataset; direct run returned 404 |

## Key gaps observed

- **LCP is high** on both `/home` and `/browse` (home ~5.8s, browse ~8.1s in sampled run).
- **Total Blocking Time is high** on both routes (home ~990ms, browse ~1590ms).
- **Accessibility and SEO are strong**, but keyboard/focus and dynamic-content checks should still be validated manually per release QA.

## Actionable remediations

1. Reduce above-the-fold payload on `/home` and `/browse` (defer non-critical sections/components).
2. Add stronger caching for event API responses and prefetch only critical queries.
3. Split heavier client bundles in browse filters and event-card stacks.
4. Keep skeletons lightweight and avoid expensive render loops during first paint.
5. Re-run Lighthouse on a real published event URL once seed/published data is available.

# Lighthouse Baseline

## Scope
- Target URL: `/home` (`http://localhost:3000/home`)
- Categories: Performance, Accessibility, Best Practices, SEO

## Execution Status
- Attempted CLI run:
  - `npx lighthouse "http://localhost:3000/home" --quiet --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path="./lighthouse-home.json"`
- Current environment blocked completion while bootstrapping Lighthouse package via `npx`.

## Current Baseline (from code audit)
- **Accessibility**: focus styles and keyboard-accessible controls implemented for core flows (`home`, `browse`, `event detail`, `dashboard`, `admin`, `organizer`).
- **SEO**: dynamic metadata for event detail, sitemap now includes browse/categories/published events.
- **Best Practices**: no hardcoded secrets in code, tokenized styling system, route-level error handling in APIs.
- **Performance UX**: skeletons, load-more fallback, fixed card aspect ratio, sticky/filter UX optimized for perceived speed.

## Gaps / Follow-up
1. Install Lighthouse as dev dependency and run in CI to produce stable numeric baseline.
2. Save JSON + HTML reports in `/docs/lighthouse/`.
3. Add threshold gate targets:
   - Accessibility >= 90
   - Best Practices >= 90
   - SEO >= 90
   - Performance >= 75 (dev), >= 85 (prod tuned)
