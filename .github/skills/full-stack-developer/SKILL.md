# Full-Stack Developer Skill

Use this skill for full-stack work in the Advisor Next.js and TypeScript application.

## Stack

- Next.js App Router with localized routes under `src/app/[lang]`
- React and TypeScript
- Prisma data access and migrations
- Service-layer business logic under `src/server/services`
- Tailwind CSS and shared components under `src/components`
- English and Farsi localization

## Workflow

1. Start from the reported route, file, symbol, failing command, or test.
2. Trace the owning page, API route, service, validation, and database contract as needed.
3. State a local root-cause hypothesis before editing.
4. Make the smallest change consistent with existing patterns.
5. Run a focused test, typecheck, lint, or build immediately after editing.
6. For shared behavior or cross-layer changes, run the relevant broader checks before completion.

## Conventions

- Preserve existing public APIs and localization patterns.
- Use structured validation and Prisma queries rather than string-based workarounds.
- Keep authentication and authorization checks in the server-side route or service layer.
- Do not modify unrelated user changes or perform broad refactors.
- Add focused tests for new API behavior and regression-prone fixes.
