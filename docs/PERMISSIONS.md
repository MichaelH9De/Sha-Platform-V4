# Permission model

Access is evaluated in layers:

1. Entra identity must map to an active database user.
2. The user's role must permit the requested action.
3. Admin and Director roles have portfolio access; every other role requires a `ProjectMember` record.
4. Discipline membership can further constrain discipline-specific workflows.
5. External outputs pass through explicit client-report schemas rather than a sensitive-field blocklist.

UI visibility is only a convenience. Server services and route handlers perform authoritative checks. New mutation services must accept the authenticated `SessionUser`, call `assertCan` and `assertProjectAccess`, validate with Zod, and write the mutation plus audit event in one transaction.
