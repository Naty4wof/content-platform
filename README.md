# Content Platform Monorepo

Monorepo for a content platform with three frontend applications and shared internal packages.

## Apps

- `admin`: internal dashboard for content operations
- `client`: user-facing experience
- `editor`: content creation and editing experience

## Packages

- `@repo/ui`: shared React UI primitives and components
- `@repo/api`: shared API contracts and server-facing utilities (in progress)
- `@repo/db`: shared data access layer and database utilities (in progress)
- `@repo/eslint-config`: shared ESLint rules
- `@repo/typescript-config`: shared TypeScript configurations

## Monorepo Principles

- Keep reusable code in `packages/*` and app-specific code in `apps/*`.
- If logic/components are used by 2 or more apps, move them to a shared package.
- Use `workspace:*` or `workspace:^` dependencies for internal packages.
- Run lint, typecheck, and build from the repository root.

## Tech Stack

- Node.js 18+
- pnpm workspaces
- Turborepo task orchestration
- Next.js 16 (apps)
- React 19
- TypeScript

## Getting Started

1. Install dependencies:

```sh
pnpm install
```

2. Start all apps in development mode:

```sh
pnpm dev
```

3. Build all apps and packages:

```sh
pnpm build
```

## Common Commands

Run at the repository root.

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm format
```

Run a single app with Turbo filters:

```sh
pnpm turbo dev --filter=admin
pnpm turbo dev --filter=client
pnpm turbo dev --filter=editor
```

Run a single app with pnpm workspace filter:

```sh
pnpm --filter admin dev
pnpm --filter client dev
pnpm --filter editor dev
```

## Repository Structure

```text
content-platform/
	apps/
		admin/
		client/
		editor/
	packages/
		api/
		db/
		ui/
		eslint-config/
		typescript-config/
	turbo.json
	pnpm-workspace.yaml
```

## Shared UI Usage

Import shared components from `@repo/ui`:

```tsx
import { Button, Card, Badge } from "@repo/ui";
```

When adding a new shared component:

1. Create it in `packages/ui/src`.
2. Export it from `packages/ui/src/index.tsx`.
3. Use it in one or more apps.

## Quality Gates

Before pushing changes:

```sh
pnpm lint
pnpm check-types
pnpm build
```

## Git Workflow

Typical flow from root:

```sh
git add .
git commit -m "feat: add shared component"
git push
```

## Next Steps

- Build out `@repo/api` and `@repo/db` as real shared packages.
- Add CI to run lint, typecheck, and build on pull requests.
- Add app-specific `.env.example` files and deployment docs.
