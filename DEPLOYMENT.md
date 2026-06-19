# Deployment

## Prototype deployment

1. Import the repository into Vercel.
2. Add `DEMO_MODE` with value `true` for Production and Preview.
3. Leave all database and Microsoft Entra variables absent.
4. Deploy.

The environment gate exits successfully in demo mode and the application redirects to the fictional `/demo` surface. No command-line secret generation is involved.

## Enterprise deployment later

1. Set `DEMO_MODE=false`.
2. Configure `DATABASE_URL`, `AUTH_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`, `AUTH_MICROSOFT_ENTRA_ID_ISSUER` and `WEBHOOK_SECRET`.
3. Run `npm run db:deploy` against the managed PostgreSQL database.
4. Bootstrap approved active users and deploy.

The enterprise path remains fail-closed when its required configuration is incomplete.
