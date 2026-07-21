# Project LOOP Architecture

Project LOOP employs a strict, layered **Clean Architecture** to ensure long-term maintainability, robust testing capabilities, and the ability to seamlessly swap underlying technologies (like AI Providers or Database engines) without breaking core business logic.

## Directory Structure

```text
├── app/                  # Next.js App Router (UI & API Routes)
│   ├── (app)/            # Authenticated Routes (Dashboard, Reports, Settings)
│   ├── (auth)/           # Public Auth Routes (Login, Signup)
│   └── api/              # Route Handlers (Controller layer)
├── components/           # React Components
│   ├── ui/               # Base shadcn/ui atoms
│   └── ...               # Feature-specific components (e.g., feedback, analytics, reports)
├── lib/                  # Core Utilities & Configurations (Auth, Database Client)
├── repositories/         # Data Access Layer (Prisma Queries)
├── schemas/              # Zod Validation Schemas & TypeScript Types
├── services/             # Core Business Logic
└── prisma/               # Database Schema & Migrations
```

## The Layered Pipeline

Every feature strictly adheres to the following one-way dependency flow:

### 1. UI Layer (`app/`, `components/`)
React Server Components (RSC) and Client Components interface with users. They never execute database queries directly. Instead, they rely on Route Handlers (APIs) or Server Actions that call the Service Layer.

### 2. API / Controller Layer (`app/api/`)
Receives HTTP requests, performs strict runtime validation using **Zod Schemas**, verifies Authentication and RBAC (Role-Based Access Control) using `requireAuth()` / `requireWorkspace()`, and delegates the actual processing to the Service layer. 
*Rule: APIs contain no business logic.*

### 3. Service Layer (`services/`)
The heart of the application. It orchestrates business rules. For instance, `ReportCompositionService` will pull data via Repositories, call out to the `AiProviderService`, and stitch together a final structured JSON report. Services depend on Repositories, never directly on Prisma.

### 4. Repository Layer (`repositories/`)
The exclusive layer for data access. It abstracts away Prisma Client operations. If the database engine or ORM changes in the future, only the Repository layer requires modification.

### 5. Schema Layer (`schemas/`)
Provides a single source of truth for both TypeScript interfaces and runtime validation boundaries (via Zod). Used by the API layer for incoming payloads and the UI layer for form structures.

## Core Design Principles

### Multi-Tenancy & Security
- Data is strictly partitioned by `workspaceId`.
- Almost every service method and repository function requires `workspaceId` to ensure cross-tenant data leakage is structurally impossible.
- Role-Based Access Control (RBAC) verifies permissions (Admin vs Member vs Viewer) at the API boundary before execution.

### Provider-Agnostic AI
The Intelligence Engine (Phase 7) abstracted the AI Provider logic (`openai`, `google`, `anthropic`). The rest of the application (Ask LOOP, VoC Reports) interacts only with generic `AiProviderService` methods, meaning the platform can hot-swap models based on cost, latency, or organizational requirements.

### Complex Data as Structured JSON
To avoid infinitely migrating rigid relational schemas for inherently dynamic AI outputs (like emergent themes, business impact parameters, and executive summaries), Project LOOP stores AI results in PostgreSQL `JSONB` columns while strictly validating the I/O using Zod schemas at runtime. This provides schema flexibility without sacrificing type safety.
