# Changelog

## 3.1.0 - Hybrid prototype mode

- Added `DEMO_MODE=true` as a one-variable Vercel prototype deployment.
- Added a complete fictional `/demo` application surface with no runtime database or authentication dependency.
- Redirected root, sign-in and enterprise routes safely into the demo while prototype mode is active.
- Kept Prisma, PostgreSQL migrations, Entra authentication and enterprise services available when demo mode is disabled.
- Kept Supabase SDK, Supabase Auth, RLS, Storage and external integrations out of scope.

## 3.0.0 - Deployment security baseline

- Replaced hardcoded sessions with Microsoft Entra OIDC, PKCE and signed server sessions.
- Standardised every environment on PostgreSQL and added a complete baseline migration.
- Added project and discipline membership scope with service-level enforcement.
- Made project, deliverable, risk and report writes transactional with their audit events.
- Added live, scoped dashboard/project views and a controlled project creation workflow.
- Secured API reporting and HMAC-authenticated integration webhooks.
- Removed duplicate public demonstration routes and added browser security headers.
- Added smoke/security gates, public-registry lockfile URLs and pinned dependency versions.

## 2.0.0 - Enterprise foundation rebuild

- Added the original Prisma model, validation, permissions, audit, service and protected-route foundation.
