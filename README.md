# PresentMam

AI-assisted attendance regularisation for colleges.

> "Life happened. Let's fix the paperwork."

## Documentation

- [PRD.md](PRD.md) — Product requirements, user personas, features, and policy definitions.
- [ARCHITECTURE.md](ARCHITECTURE.md) — System architecture, data model, state machines, and API surface.
- [RULES.md](RULES.md) — Non-negotiable engineering, testing, security, and AI constraints.
- [DESIGN.md](DESIGN.md) — Design tokens, visual language, component specs, and microcopy.
- [TASKS.md](TASKS.md) — Phased implementation plan and task tracking.
- [MEMORY.md](MEMORY.md) — Long-term project memory, decisions, and phase logs.

## Supabase Setup (Prerequisites for Phase 1+)

PresentMam uses Supabase for Authentication, PostgreSQL database, and private file Storage.

> **Note:** Remote project provisioning requires manual account setup. Do not commit actual secrets to the repository.

### 1. Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project named `presentmam`.
2. Securely store your database password.
3. From **Project Settings -> API**, obtain:
   - `Project URL`
   - `anon` `public` key
   - `service_role` secret key
   - `JWT Secret`

### 2. Configure Auth
1. Under **Authentication -> Providers**, enable Email (or Google OAuth with college domain restrictions).
2. Note the JWT verification secret or JWKS endpoint for FastAPI token validation.

### 3. Configure Database (PostgreSQL)
1. From **Project Settings -> Database**, retrieve the connection string.
2. In the FastAPI backend, use the asyncpg driver format:
   `postgresql+asyncpg://postgres:[YOUR-PASSWORD]@[HOST]:[PORT]/postgres`
3. All tables in Phase 1 will have Row Level Security (RLS) enabled with no public policies as defence in depth; all reads/writes go through FastAPI.

### 4. Create Private Storage Bucket
1. Navigate to **Storage -> Buckets** in the Supabase dashboard.
2. Create a new bucket named `evidence-files`.
3. Set bucket visibility to **Private** (disable Public bucket access).
4. File access is strictly brokered by the backend using short-lived signed URLs with access logging.

### 5. Local Environment Files
Copy the templates and supply local values:
```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend
cp apps/api/.env.example apps/api/.env
```
Real environment files are ignored by Git. Never commit credentials to version control.
