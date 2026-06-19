# MEP Enterprise Platform — Prototype + Enterprise Foundation

This release supports two explicit deployment modes.

## Prototype mode — deploy now

Set one Vercel environment variable:

```env
DEMO_MODE=true
```

Then deploy normally. No PostgreSQL/Supabase account, Microsoft Entra application, password, secret, migration or seed command is required. Visitors open directly into `/demo/dashboard`, backed by compiled fictional records. The prototype is read-only and clearly labelled; it must not hold real company or client information.

Vercel runs:

```bash
npm ci
npm run vercel-build
```

`scripts/check-env.mjs` recognises demo mode, Prisma Client generation remains available for the enterprise source, and the Next.js build includes both surfaces.

## Enterprise mode — activate later

Set `DEMO_MODE=false`, configure the PostgreSQL and Microsoft Entra variables documented in `.env.example`, apply migrations with `npm run db:deploy`, and bootstrap approved users. The original `/platform` routes, Prisma schema, migrations, transactional services, project permissions and Entra flow remain intact.

No Supabase SDK, Supabase Auth, RLS, Storage or third-party integration has been added.
