# Home Expense Tracker — Design Document

## 1. Overview

A multi-user household expense tracking application with family sharing, INR currency, budget alerts, recurring expenses, planned expenses, investments tracking, and reporting.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | base-ui (shadcn/ui) + Tailwind CSS v4 |
| Database | SQLite via better-sqlite3 |
| ORM | Drizzle ORM |
| Auth | Custom JWT (jose) + bcryptjs |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| CSV Export | Manual generation |
| HTTP Client | fetch (built-in) |
| Data Fetching | @tanstack/react-query |
| Date Handling | date-fns |
| Notifications | sonner (toast) |
| Theme | next-themes |

---

## 3. Project Structure

```
src/
├── app/
│   ├── api/            # API route handlers
│   ├── (auth)/         # Login, Register pages
│   ├── (protected)/    # Authenticated pages (layout + pages)
│   └── globals.css     # Tailwind v4 theme
├── components/
│   ├── shared/         # Sidebar, layout components
│   ├── ui/             # shadcn/ui primitives
│   └── dashboard/      # Dashboard client components
├── db/
│   ├── index.ts        # DB connection + init + seed
│   ├── schema.ts       # Drizzle table definitions
│   └── data.db         # SQLite database file
├── lib/
│   ├── dal.ts          # Data access layer (session, user)
│   ├── format.ts       # INR formatting
│   ├── session.ts      # JWT encrypt/decrypt
│   └── utils.ts        # cn() utility
proxy.ts                 # Next.js 16 auth middleware
next.config.ts           # Server external packages config
```

---

## 4. Database Schema

### Tables

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | TEXT NOT NULL | Display name |
| email | TEXT UNIQUE NOT NULL | Login identifier |
| password | TEXT NOT NULL | bcrypt hashed |
| family_id | INTEGER FK | References families(id), nullable |
| created_at | TEXT | Auto-set |

**families**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | TEXT NOT NULL | Family group name |
| owner_id | INTEGER FK NOT NULL | References users(id) |
| created_at | TEXT | Auto-set |

**categories**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| name | TEXT NOT NULL | "Food & Dining" |
| type | TEXT CHECK | "expense" or "income" |
| icon | TEXT | Lucide icon name |
| color | TEXT | Hex color |
| user_id | INTEGER FK | Nullable (global categories) |
| family_id | INTEGER FK | Nullable |
| UNIQUE INDEX | (name, type, user_id, family_id) | Prevents duplicates |

**expenses**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| amount | REAL NOT NULL | In INR |
| description | TEXT | Optional |
| date | TEXT NOT NULL | ISO date |
| category_id | INTEGER FK | References categories |
| user_id | INTEGER FK | References users |
| family_id | INTEGER FK | Nullable |
| receipt_url | TEXT | Nullable |
| created_at | TEXT | Auto-set |

**incomes** — Same structure as expenses.

**budgets**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| category_id | INTEGER FK | References categories |
| amount | REAL NOT NULL | Monthly limit |
| month | INTEGER | 1-12 |
| year | INTEGER | 4-digit |
| user_id | INTEGER FK | |
| family_id | INTEGER FK | Nullable |
| created_at | TEXT | |

**recurring_expenses**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| amount | REAL | |
| description | TEXT | |
| category_id | INTEGER FK | |
| frequency | TEXT CHECK | daily/weekly/monthly/yearly |
| next_date | TEXT | Next occurrence |
| user_id | INTEGER FK | |
| family_id | INTEGER FK | |
| active | INTEGER | Boolean flag |
| created_at | TEXT | |

**investments**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| type | TEXT CHECK | deposit/mutual_fund/gold/art/other |
| amount | REAL NOT NULL | |
| quantity | REAL | Nullable (units, grams) |
| purchase_date | TEXT NOT NULL | |
| notes | TEXT | Optional |
| user_id | INTEGER FK | |
| family_id | INTEGER FK | |
| created_at | TEXT | |

**planned_expenses**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT NOT NULL | |
| amount | REAL NOT NULL | |
| due_date | TEXT NOT NULL | |
| frequency | TEXT CHECK | one_time/monthly/quarterly/yearly |
| notes | TEXT | Optional |
| user_id | INTEGER FK | |
| family_id | INTEGER FK | |
| created_at | TEXT | |

**sessions**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| user_id | INTEGER FK | |
| expires_at | TEXT | Expiry timestamp |
| created_at | TEXT | |

---

## 5. Authentication Flow

1. **Register** → `POST /api/auth/register` → bcrypt hash password → insert user → create JWT session cookie
2. **Login** → `POST /api/auth/login` → verify bcrypt → create JWT session cookie
3. **Verify** → `proxy.ts` middleware reads `session` cookie → decrypt JWT → verify session exists in DB → attach `userId` to request
4. **Logout** → `POST /api/auth/logout` → delete session from DB → clear cookie

### Session Cookie
- Name: `session`
- JWT payload: `{ userId, expiresAt }`
- Signed with jose (S256 algorithm via `EncryptJWT`)
- Cookie: `httpOnly`, `secure` (prod), `sameSite: "lax"`

---

## 6. API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |
| GET | /api/expenses | List expenses (paginated, filterable, sortable) |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/[id] | Update expense |
| DELETE | /api/expenses/[id] | Delete expense |
| GET | /api/incomes | List incomes (paginated, sortable) |
| POST | /api/incomes | Create income |
| PUT | /api/incomes/[id] | Update income |
| DELETE | /api/incomes/[id] | Delete income |
| GET | /api/categories | List categories |
| POST | /api/categories | Create custom category |
| PUT | /api/categories/[id] | Update category |
| DELETE | /api/categories/[id] | Delete category |
| GET | /api/budgets | List budgets (filter by month/year) |
| POST | /api/budgets | Set budget |
| DELETE | /api/budgets/[id] | Remove budget |
| GET | /api/recurring | List recurring expenses |
| POST | /api/recurring | Add recurring expense |
| PUT | /api/recurring/[id] | Update recurring expense |
| DELETE | /api/recurring/[id] | Delete recurring expense |
| GET | /api/planned-expenses | List planned expenses |
| POST | /api/planned-expenses | Add planned expense |
| PUT | /api/planned-expenses/[id] | Update planned expense |
| DELETE | /api/planned-expenses/[id] | Delete planned expense |
| GET | /api/family | Get family details + members |
| POST | /api/family | Create family |
| PUT | /api/family | Rename family |
| POST | /api/family/add-member | Owner adds member (name + email + password) |
| GET | /api/investments | List investments (owner-only) |
| POST | /api/investments | Add investment |
| PUT | /api/investments/[id] | Update investment |
| DELETE | /api/investments/[id] | Delete investment |
| GET | /api/reports | Get report data (by category, monthly, etc.) |

### Query Parameters (Expenses GET)

| Param | Type | Description |
|-------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| from | string | Start date (ISO) |
| to | string | End date (ISO) |
| categoryId | number | Filter by category |
| minAmount | number | Minimum amount |
| maxAmount | number | Maximum amount |
| search | string | Search in description (case-insensitive) |
| sortBy | string | Field: date, amount, category, name |
| sortOrder | string | asc or desc |

---

## 7. Family Sharing

### Flow
1. User creates a family → becomes the **owner** (`family.ownerId = userId`)
2. Owner adds members by email + password → member accounts created with `familyId` set
3. When any member adds an expense/income, `familyId` is auto-set from the user's current family
4. API GET scopes query to all users sharing the same `familyId`
5. Owner can rename the family; only owner can add members

### Family-scoped Queries
```typescript
let userIds = [currentUserId];
if (user.familyId) {
  const members = db.select(...).from(users).where(eq(users.familyId, user.familyId));
  userIds = members.map(m => m.id);
}
// Query with inArray(expenses.userId, userIds)
```

---

## 8. UI Pages

| Route | Page | Description |
|-------|------|-------------|
| /login | Login | Email + password form |
| /register | Register | Name + email + password form |
| /dashboard | Dashboard | Monthly summary cards, recent expenses, monthly comparison chart |
| /expenses | Expenses | CRUD table with pagination, search, filter bar, sort controls |
| /incomes | Income | CRUD table with pagination, sort controls |
| /budgets | Budgets | Monthly budget cards with progress bars, over-budget alerts |
| /categories | Categories | Manage expense/income categories |
| /recurring | Recurring | Recurring bills/subscriptions manager |
| /planned-expenses | Planned | Major expected expenses (insurance, repairs) |
| /investments | Investments | Track deposits, mutual funds, gold, art (owner-only) |
| /reports | Reports | Charts (pie, bar), date range filter, CSV/PDF export |
| /family | Family | Create family, add members, view members list |

### Navigation Sidebar
- Dashboard, Expenses, Income, Budgets, Categories, Recurring, Planned, Investments, Reports, Family, Logout

---

## 9. Key Design Decisions

1. **SQLite over PostgreSQL/MySQL**: Zero setup, single file, perfect for a local/self-hosted app
2. **Custom JWT auth over next-auth**: Simpler, no external dependencies for OAuth
3. **`proxy.ts` over `middleware.ts`**: Next.js 16 convention for auth middleware
4. **`render` prop on DialogTrigger**: Avoids button-in-button hydration error (base-ui pattern)
5. **`Intl.NumberFormat("en-IN")` for INR**: Standard Indian numbering (1,23,456.78)
6. **Family scope via shared `userIds` array**: All queries include all family members
7. **Dynamic `orderBy` in API**: Sort parameter maps to a Drizzle column expression
8. **Owner-only sections**: Investments tab restricted to family owner (or any user if no family)

---

## 10. Current Limitations

- Single currency (INR) — no multi-currency support
- No receipt/image upload (field exists but unused)
- No email verification
- No password reset flow
- SQLite is not suitable for high-concurrency production deployment
- No tests (manual testing only)
