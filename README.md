# Home Expense Tracker

A multi-user household expense tracking application with family sharing, INR currency, budget alerts, recurring expenses, planned expenses, investments tracking, and reporting.

Built with Next.js 16, TypeScript, SQLite (Drizzle ORM), Base UI, Tailwind CSS v4, and React Query.

## Features

- **Expenses & Income** — Full CRUD with pagination, search, filters, and sorting
- **Budgets** — Monthly limits per category with progress bars and over-budget alerts
- **Recurring Expenses** — Track subscriptions/bills with daily/weekly/monthly/yearly frequency
- **Planned Expenses** — Major expected expenses (insurance, repairs) with overdue/upcoming badges
- **Investments** — Track deposits, mutual funds, gold, art (owner-only access)
- **Reports** — Pie charts (by category), bar charts (income vs expense), CSV/PDF export
- **Family Sharing** — Create a family group, add members, share all data
- **Dark Mode** — Toggleable with persistence
- **INR Currency** — Indian numbering format (₹ 1,23,456.78)

## Quick Start

See [SETUP.md](SETUP.md) for detailed setup instructions.

```bash
git clone https://github.com/nirav-email81/home-expense-tracker.git
cd home-expense-tracker
npm install
# Create .env with SESSION_SECRET
npm run dev
```

## Documentation

- [DESIGN.md](DESIGN.md) — Architecture, schema, API routes, design decisions
- [TESTCASES.md](TESTCASES.md) — Manual test cases for all features
- [SETUP.md](SETUP.md) — Step-by-step setup guide for new users

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | Base UI (shadcn/ui style) + Tailwind CSS v4 |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Auth | Custom JWT (jose) + bcryptjs |
| Charts | Recharts |
| Data Fetching | @tanstack/react-query |
| Notifications | sonner (toast) |
| Theme | next-themes |
