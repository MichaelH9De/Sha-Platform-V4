# Security operations

Implemented controls include Entra ID authentication, active-user allowlisting, eight-hour sessions, project membership checks, role/action checks, strict client-report allowlisting, Zod input validation, transactional audit events, HMAC-authenticated webhooks, payload limits and baseline browser security headers.

External users must never receive margin, utilisation, staffing allocation, internal commercial notes, internal QA comments, draft risk assessments, fee forecasts or internal resource assumptions. Additions to client reports require a reviewed change to `clientReportSchema`.

Deployment controls remain operational responsibilities: configure Vercel WAF rate limits, managed-database backups and restore tests, centralised logs and alerts, secret rotation, audit retention, dependency monitoring and an independent penetration test before confidential production data is onboarded.

The demonstration seed is fictional and must not be run against production.
