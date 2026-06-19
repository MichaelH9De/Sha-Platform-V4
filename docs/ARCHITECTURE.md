# Architecture

All operational UI lives below `app/(protected)/platform`. The protected layout requires a signed server session established through Microsoft Entra ID OpenID Connect with authorization-code flow, PKCE, state, nonce and RS256 token validation. Sign-in is allowed only when the Entra email matches an active database user.

Pages scope reads to portfolio roles or `ProjectMember`. Server actions collect untrusted input and delegate to `server/services`. Services are the mutation choke point: validation, action permission, project membership, persistence and `AuditEvent` creation. Material writes and audit records share one Prisma transaction. A PostgreSQL trigger rejects updates and deletes against `AuditEvent`, making the table append-only.

PostgreSQL is the only datasource, preventing SQLite/PostgreSQL behaviour drift. Prisma migrations are committed and applied through the controlled `db:deploy` release step.

External report data is parsed by an explicit Zod allowlist. Raw project objects are not accepted as external output. Integration webhooks require an HMAC-SHA256 signature and strict payload validation.

The health endpoint is intentionally public and contains no database credentials or sensitive status detail. Authentication callbacks are public by protocol. All other application routes are authenticated or cryptographically authenticated.
