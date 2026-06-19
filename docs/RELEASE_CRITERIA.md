# Release criteria

## Code gate

- Clean `npm ci` succeeds from the public npm registry.
- `npm run check` passes: Prisma generation, typecheck, lint, smoke test, security/unit tests and production build.
- PostgreSQL baseline migration matches `schema.prisma` and `npm run db:deploy` succeeds.

## Security gate

- Entra authorization-code flow validates PKCE, state, nonce, issuer, audience, expiry and RS256 signature.
- Only active allowlisted database users can establish a session.
- Non-portfolio users cannot read or mutate projects without membership.
- Client outputs are schema-allowlisted and webhooks require valid HMAC signatures.
- Material writes and audit events are transactional.

## Operational gate

- Target environment has managed PostgreSQL backups, tested restore, Vercel WAF rules, alert ownership and secret rotation.
- Production is seeded only through a reviewed administrator bootstrap process.
- Independent security testing is completed before confidential data onboarding.
