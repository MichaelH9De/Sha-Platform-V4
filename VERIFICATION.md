# Verification record

Packaging environment checks completed on 18 June 2026:

- `scripts/smoke-test.mjs` passed.
- `scripts/audit-package.mjs` passed across 49 source files and 26 migrated Prisma models.
- `scripts/check-env.mjs` passed with non-secret representative configuration.
- Package and lockfile manifests agree.
- All dependency tarball URLs use the public npm registry.
- All local imports resolve and the PostgreSQL baseline contains every Prisma model.
- No `.env`, database, build output or dependency directory is included.

The packaging runtime supplied Node but no npm executable, as requested no system package-manager installation or system inspection was used. Therefore `npm ci`, Prisma generation, TypeScript, ESLint and the Next.js production build must be executed by the deployment CI using `npm run check`. Vercel performs `npm ci`, environment validation, Prisma generation and the production build automatically; promotion should remain blocked unless those commands pass.
