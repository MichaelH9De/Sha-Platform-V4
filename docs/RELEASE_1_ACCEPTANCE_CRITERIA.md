# Version 3 deployment acceptance

The deployable baseline is accepted when the code, security and operational gates in `RELEASE_CRITERIA.md` are satisfied. Preview deployment may use fictional seed data. Production deployment must use approved organisational identities and managed PostgreSQL.

The platform surface is `/platform`; legacy public demonstration routes have been removed. Projects and dashboard views use live Prisma records with project-scoped reads. Remaining modules are protected extension points and must follow the service workflow contract before gaining mutations.
