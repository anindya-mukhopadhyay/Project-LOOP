# Project LOOP

**Enterprise AI Customer Feedback Intelligence Platform**

Project LOOP is a production-grade, multi-tenant SaaS application designed to aggregate, analyze, and extract actionable intelligence from customer feedback at scale. Built with a modern, highly scalable architecture, it leverages LLM capabilities to classify sentiment, identify emerging themes, power Retrieval-Augmented Generation (RAG) capabilities, and generate executive-ready intelligence reports.

## Features

Project LOOP was systematically built over 10 focused phases:

- **Phase 1: Enterprise Foundation** - Robust Next.js 15 App Router setup, Clean Architecture, and modern UI tokens (shadcn/ui + Tailwind CSS).
- **Phase 2: Database Layer** - PostgreSQL + Prisma ORM setup supporting multi-tenancy and complex querying.
- **Phase 3: Authentication & RBAC** - Auth.js (NextAuth) integration providing secure login and enterprise Role-Based Access Control (Admin, Member, Viewer).
- **Phase 4: Workspace & Team Management** - Secure multi-tenant architecture allowing users to create workspaces, invite team members, and manage access limits.
- **Phase 5: Feedback Management** - Scalable ingestion engine (CSV, API integrations) to unify customer feedback across channels.
- **Phase 6: Analytics Dashboard** - Real-time metrics and charts using Recharts for volume, sentiment trends, and multi-dimensional analysis.
- **Phase 7: AI Intelligence Engine** - Configurable AI abstraction layer (OpenAI, Google Gemini, Anthropic) for intelligent sentiment classification and keyword extraction.
- **Phase 8: Theme Intelligence Engine** - AI-powered autonomous clustering, categorizing, and tracking of feedback themes (Emerging vs Declining).
- **Phase 9: Ask LOOP (Knowledge Platform)** - RAG-based knowledge retrieval answering complex business questions securely scoped to workspace contexts with explicit citations.
- **Phase 10: VoC Intelligence Platform** - Automated, structured Voice of Customer report generation (Executive Summaries, Trend Analysis, Business Impact) via a composition engine.

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Provide values for Database and Auth endpoints

# 3. Provision the database
npm run prisma:generate
npm run prisma:migrate

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a comprehensive overview of the design patterns, data flows, and structural decisions powering Project LOOP.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth)
- **UI/Styling**: Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
- **Validation**: Zod & React Hook Form
- **AI Integrations**: Provider-agnostic abstraction ready for Gemini/OpenAI

## Documentation

- User Guide: *Capture screenshots and place them in the `/docs/` directory.*
- Video Demo: *Link a walkthrough of the core feature set here.*
