# PROJECT LOOP

AI Customer Feedback Intelligence Platform.

This repository contains the production foundation for a multi-tenant SaaS application built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, Auth.js, Zod, React Hook Form, Lucide React, Framer Motion, Sonner, and Recharts.

## Getting Started

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev              # Start the Next.js development server
npm run build            # Create a production build
npm run start            # Start the production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript checks
npm run format           # Format files with Prettier
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run Prisma migrations
npm run prisma:studio    # Open Prisma Studio
npm run db:seed          # Run the seed entry point
```

## Architecture

Project LOOP uses a layered architecture:

```txt
UI routes and components
  -> API route handlers and server boundaries
    -> Zod schemas and validators
      -> Services
        -> Repositories
          -> Prisma Client
            -> PostgreSQL
```

The foundation intentionally avoids business modules in Phase 1. Future features plug into dedicated route, schema, service, repository, and component folders without coupling UI to persistence.

## Phase 1 Scope

- Next.js App Router foundation
- Strict TypeScript configuration
- Tailwind CSS and shadcn/ui design tokens
- Dark mode theme provider
- App shell with sidebar, navbar, page shell, skeletons, and error states
- Auth.js base configuration without login flows
- Prisma configured without models
- Clean Architecture folders for AI, services, repositories, schemas, validators, hooks, providers, and types

## Environment

Copy `.env.example` to `.env` and provide production values before deployment. `SKIP_ENV_VALIDATION=1` may be used only for bootstrap or CI steps that do not require runtime services.
