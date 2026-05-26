# Clinic ART Tracker

A web app for HIV clinic staff to enroll patients, log clinical visits and viral load
tests, and generate monthly retention and viral suppression reports.

> **Demo project — synthetic data only.** Not HIPAA/GDPR audited, not a production
> clinical system. No real PHI/PII is stored.

## Features

- Email/password auth with two roles (`CLINICIAN`, `MANAGER`)
- Anonymized patient enrollment (anon ID, sex, birth year, district, ART start, regimen)
- Patient list with search by anon ID + filter by district / status
- Patient detail page: visit history, viral-load chart (log scale + 1,000 cp/mL threshold),
  inline “Add visit” and “Add viral load” forms
- Manager-only reports: new enrollments this month, active on ART, retention rate,
  viral suppression rate, 12-month enrollment bar chart, suppression trend line chart
- CSV export of the patient list
- Audit log on every create/update

## Demo credentials

| Role      | Email                 | Password   |
| --------- | --------------------- | ---------- |
| Manager   | `manager@demo.ahf`    | `demo1234` |
| Clinician | `clinician@demo.ahf`  | `demo1234` |

## Tech stack

- **Next.js 14** (App Router) + TypeScript — frontend and API routes in one app
- **Tailwind CSS** for styling
- **Prisma** ORM + **PostgreSQL** (Supabase free tier)
- **NextAuth.js** (Credentials provider) + `bcryptjs`
- **Zod** for input validation
- **Recharts** for charts
- **@faker-js/faker** for seed data

Architecture: `Browser → Next.js (RSC + Route Handlers) → Prisma → PostgreSQL`.

## Project structure

```
clinic-art-tracker/
├── app/
│   ├── layout.tsx                   role-aware navbar
│   ├── page.tsx                     redirect → /dashboard or /login
│   ├── login/                       sign-in page
│   ├── dashboard/                   KPI cards + quick links
│   ├── patients/
│   │   ├── page.tsx                 list + search + filter
│   │   ├── new/                     enrollment form
│   │   └── [id]/                    detail (visits + VL chart + add forms)
│   ├── reports/                     manager-only KPIs + charts
│   └── api/
│       ├── auth/[...nextauth]/
│       ├── patients/                GET list, POST create
│       ├── patients/[id]/           GET, PATCH
│       ├── visits/                  POST
│       ├── viral-loads/             POST (computes suppressed = copies < 1000)
│       ├── reports/monthly/         GET (manager-only)
│       └── export/patients/         GET (CSV)
├── components/                      PatientForm, VisitForm, ViralLoadChart, etc.
├── lib/                             prisma, auth, validators, audit, reports
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                      50 patients + visits + VLs
├── middleware.ts                    protects /dashboard, /patients, /reports
└── .env                             DATABASE_URL, NEXTAUTH_SECRET
```

## API reference

| Method | Path                            | Auth        | Purpose                                       |
| ------ | ------------------------------- | ----------- | --------------------------------------------- |
| POST   | `/api/auth/callback/credentials`| public      | NextAuth credentials sign-in                  |
| GET    | `/api/patients`                 | any session | List patients (`?q=&district=&status=`)       |
| POST   | `/api/patients`                 | any session | Create patient                                |
| GET    | `/api/patients/:id`             | any session | Patient with visits + viral loads             |
| PATCH  | `/api/patients/:id`             | any session | Update patient                                |
| POST   | `/api/visits`                   | any session | Record a visit (recordedBy = current user)    |
| POST   | `/api/viral-loads`              | any session | Record a viral-load result                    |
| GET    | `/api/reports/monthly`          | `MANAGER`   | KPIs + 12-month series                        |
| GET    | `/api/export/patients`          | any session | CSV download of patient list                  |

## Local setup

### 1. Database — Supabase (free tier)

1. Create a project at <https://supabase.com>.
2. Settings → Database → Connection string (URI). Copy and replace `[YOUR-PASSWORD]`.

### 2. Environment

Create `.env` from `.env.example`:

```bash
DATABASE_URL="postgresql://postgres.xxxx:PASSWORD@aws-0-xxx.pooler.supabase.com:5432/postgres"
NEXTAUTH_SECRET="<32+ character random string>"
NEXTAUTH_URL="http://localhost:3000"
```

Generate a secret on Windows PowerShell:

```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

### 3. Install, migrate, seed, run

```bash
npm install
npx prisma migrate dev --name init    # creates tables in Supabase
npx prisma db seed                    # 50 synthetic patients + visits + VLs
npm run dev                           # http://localhost:3000
```

Useful scripts:

```bash
npm run db:migrate    # alias for prisma migrate dev
npm run db:seed       # alias for prisma db seed
npm run db:studio     # prisma studio (browse the DB)
```

## Deployment (Vercel + Supabase)

1. Push to GitHub.
2. Import the repo into Vercel.
3. In Vercel project settings → Environment Variables, add:
   - `DATABASE_URL` (same Supabase connection string)
   - `NEXTAUTH_SECRET` (a fresh long random string)
   - `NEXTAUTH_URL` (your Vercel URL, e.g. `https://clinic-art-tracker.vercel.app`)
4. Deploy. Migrations run via `prisma migrate deploy` if you wire it into the build
   command (`prisma generate && prisma migrate deploy && next build`).

## Important caveats

- This project stores **only anonymized patient identifiers** by design. The schema has
  no field for name, exact DOB, phone, address, or any other direct identifier.
- This is a portfolio / demonstration project. It is **not** clinically validated, does
  not implement HIPAA or local data-protection requirements, and should not be used to
  manage real patients.
- Audit logging is append-only via `AuditLog`, but no log-shipping or tamper-evidence
  is implemented.

## Limitations & future work

- Pagination on the patient list (currently capped at 500 rows)
- Role-based write protection on visit/VL edits (today any signed-in user can record)
- Soft-delete + restore for patients
- Multi-clinic / multi-tenant support
- Drug interaction warnings; ART regimen change history
- Two-factor authentication
- Backup + restore documentation
- Replace `force-dynamic` rendering with proper revalidation tags
