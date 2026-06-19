# Data Model

The Prisma schema defines the core operating spine for an MEP consultancy project-control system.

## Core entities

- User, Role, Permission, RolePermission and ProjectMember define identity, role capability and project/discipline scope.
- Client and Project define the commercial/project portfolio.
- Appointment and ScopeItem define appointment scope, fee basis and inclusions/exclusions.
- Stage and StageTemplate define staged delivery aligned to RIBA/BSRIA-style project control.
- Discipline and Deliverable define discipline-owned design outputs.
- Action, Risk, Decision and InformationRequest define control registers.
- FeeBudget, FeeForecast and ResourceAllocation support fee/resource control.
- QAReview and BIMRecord support technical quality and digital-design governance.
- Report, ReportTemplate and AuditEvent support reporting and traceability.

## Rules

Every operational record has ownership, status, timestamps and project linkage where applicable. Material mutations and their AuditEvent are committed in one database transaction.
