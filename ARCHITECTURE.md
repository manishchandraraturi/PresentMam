# ARCHITECTURE.md: PresentMam

Version 1.0 | 14 Oct 2026
Companion to PRD.md. If this file and PRD.md ever disagree, stop and record the conflict in MEMORY.md before coding.

---

## 1. System overview

```
                  +--------------------+
                  |   Browser (PWA-    |
                  |   ready web app)   |
                  |  Next.js + TS      |
                  +---------+----------+
                            | HTTPS (JWT from Supabase Auth)
                            v
+------------------+   +----+------------------+     +--------------------+
| Supabase Auth    |<--|   FastAPI backend     |---->| Vision LLM provider|
| (login, JWT)     |   |  (all business logic) |     | (behind interface) |
+------------------+   |                       |     +--------------------+
                       |  routers -> services  |
+------------------+   |  -> repositories      |     +--------------------+
| Supabase Storage |<--|                       |---->| Email provider     |
| (evidence files, |   |  policy engine        |     | (Resend or SMTP)   |
|  private bucket) |   |  AI pipeline          |     +--------------------+
+------------------+   |  correction engine    |
                       |  audit chain          |
+------------------+   +----+------------------+
| Supabase Postgres|<--------+      |
| (single source   |                v
|  of truth)       |        +-------+---------+
+------------------+        | ERP adapter     |
                            | Mock | CSV | Real(later)
                            +-----------------+
```

**Key decisions**
- **All data reads/writes go through FastAPI.** The browser uses Supabase only for login (JWT). Database tables have Row Level Security enabled with no public policies as defence in depth.
- **Business rules live in the backend**, never in the frontend. The frontend hides buttons for UX; the backend enforces permissions.
- **AI is a module behind an interface.** It can fail, be replaced, or be switched off without affecting approval and attendance logic.
- **ERP is an adapter.** Prototype uses `MockERPAdapter` (writes to our own `attendance_records`). A `CsvExportAdapter` produces reports. A real adapter comes only with official college access.

## 2. Tech stack

> Pin exact versions at install time. Verify the latest stable version with `npm view <pkg> version` / `pip index versions <pkg>` and the official docs. **Do not copy versions or API shapes from memory or from this file.**

### Frontend (`apps/web`)
| Purpose | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS plus CSS variables for design tokens (see DESIGN.md) |
| Headless UI primitives | Radix UI primitives (dialog, popover, tabs, tooltip, sheet behaviour). Style them ourselves; do NOT ship unmodified template components |
| Calendar | react-day-picker (heavily restyled) |
| Data fetching | TanStack Query |
| Forms and validation | React Hook Form plus Zod |
| Motion | Motion library (formerly Framer Motion; verify current package name in its docs) |
| Icons | Lucide plus custom SVG stickers |
| Toasts | Sonner (restyled) |
| Theming | next-themes |
| Fonts | `next/font/google`: Bricolage Grotesque, Figtree |
| Auth client | `@supabase/supabase-js` and `@supabase/ssr` (login/session only) |
| Utilities | date-fns, clsx, tailwind-merge, canvas-confetti (used once, on "Attendance updated") |

### Backend (`apps/api`)
| Purpose | Choice |
|---|---|
| Language/runtime | Python (current stable 3.x), FastAPI, Uvicorn |
| Validation/settings | Pydantic v2, pydantic-settings |
| DB access | SQLAlchemy 2.x (async) with asyncpg; Alembic migrations |
| Auth verification | PyJWT verifying Supabase JWTs (JWKS or secret per Supabase docs) |
| PDF text/render | PyMuPDF |
| Images | Pillow, imagehash (pHash), opencv-python-headless (preprocess, QR detection), numpy |
| Fuzzy matching | rapidfuzz |
| Vision LLM | Provider interface; default adapter uses Google's Gemini API via the official current Python SDK (verify package name in docs). Model name comes from env `VISION_MODEL`; never hard-code |
| HTTP/retry | httpx, tenacity |
| Rate limiting | slowapi |
| Logging | structlog (JSON), request-id middleware |
| PDF/QR output | reportlab, qrcode[pil] |
| Email | Resend SDK or SMTP (behind `Notifier` interface) |
| Tests/quality | pytest, pytest-asyncio, httpx test client, ruff, mypy (optional but encouraged) |

### Infra
| Purpose | Choice |
|---|---|
| Database, Auth, Storage | Supabase (Postgres, Auth, private Storage bucket) |
| Frontend hosting | Vercel |
| Backend hosting | Render or Railway (container) |
| CI | GitHub Actions: lint, type-check, test |
Check free-tier limits on all providers at deploy time; limits change.

## 3. Repository structure

```
presentmam/
  README.md
  PRD.md  ARCHITECTURE.md  RULES.md  DESIGN.md  TASKS.md  MEMORY.md
  apps/
    web/                         # Next.js app
      src/
        app/                     # routes (student, faculty, admin, auth)
          (auth)/login/
          (student)/home/ request/new/ request/[id]/ history/
          (faculty)/queue/ review/[id]/ reports/
          (hod)/overview/ exceptions/ audits/
          (admin)/users/ timetable/ policy/ audit-log/
          action/[token]/        # email-link confirm page
        components/              # ui/, student/, faculty/, shared/
        lib/                     # api client, supabase client, utils
        styles/                  # tokens.css, globals.css
      public/                    # stickers (svg), og image, icons
    api/
      app/
        main.py                  # app factory, middleware, routers
        core/                    # config, security, errors, logging, deps
        db/                      # models, session, repositories
        routers/                 # auth, requests, evidence, review, admin, reports, actions
        services/
          requests.py            # create/submit/withdraw/appeal
          policy.py              # policy engine
          review.py              # decisions, overrides, escalation
          corrections.py         # correction state machine
          audit.py               # hash-chained audit events
          notifications.py
          retention.py
          letters.py             # PDF + QR leave letter, CSV report
        ai/
          pipeline.py            # orchestrates steps
          providers/             # base.py, gemini.py, fake.py (for tests)
          extract.py             # category schemas + extraction
          validators.py          # identity, dates, periods, issuer checks
          duplicates.py          # sha256, pHash, id uniqueness
          triage.py              # rules -> triage + strength band
          explain.py             # findings -> plain text
          safety.py              # untrusted-text handling
        erp/
          base.py  mock.py  csv_export.py
      alembic/
      tests/
      eval/                      # dataset generator, run_eval.py, labels
  supabase/                      # SQL notes, storage bucket policy
  .github/workflows/
```

## 4. Data model

All tables have `id uuid primary key default gen_random_uuid()` (unless noted) and `created_at timestamptz default now()`. Enum types listed after tables.

**People and structure**
- `profiles`: `id` (= auth user id), `role`, `full_name`, `email`, `usn` (nullable), `section_id` (nullable for staff), `active`.
- `departments`: `name`, `code`.
- `sections`: `department_id`, `name`, `semester`, `academic_year`, `class_teacher_id`.
- `subjects`: `code`, `name`, `department_id`.
- `teaching_assignments`: `section_id`, `subject_id`, `teacher_id`.

**Timetable and sessions**
- `timetable_slots`: `section_id`, `subject_id`, `teacher_id`, `weekday`, `period_no`, `start_time`, `end_time`, `slot_type` (THEORY, LAB, ASSESSMENT).
- `calendar_exceptions`: `date`, `section_id` (nullable = all), `type` (HOLIDAY, CANCELLED, RESCHEDULED, EXAM), `note`.
- `class_sessions`: materialised per date: `slot_id`, `section_id`, `date`, `subject_id`, `teacher_id`, `period_no`, `start_time`, `end_time`, `slot_type`, `status` (SCHEDULED, CANCELLED, RESCHEDULED, HOLIDAY). Unique (`section_id`, `date`, `period_no`). Generated by a job from `timetable_slots` plus `calendar_exceptions`.
- `attendance_records`: `session_id`, `student_id`, `status` (see enums), `updated_by`, `updated_at`, `source` (TEACHER, CORRECTION, SEED). Unique (`session_id`, `student_id`).

**Requests**
- `absence_requests`: `student_id`, `category`, `reason_text`, `status`, `submitted_at`, `deadline_flag_late` (bool), `triage` (nullable), `ai_status` (NOT_RUN, RUNNING, DONE, INCONCLUSIVE), `current_reviewer_id`, `consent_id`, `escalated_to_hod` (bool), `awaiting_proof_until` (nullable).
- `request_sessions`: `request_id`, `session_id`, `decision` (PENDING, APPROVED, REJECTED, NEEDS_INFO, NOT_APPLICABLE), `decision_reason`, `decided_by`, `decided_at`, `resulting_status`. Unique (`request_id`, `session_id`).
- `evidence_files`: `request_id`, `storage_path`, `sha256`, `phash` (nullable), `mime`, `size_bytes`, `delete_after`, `deleted_at`.
- `evidence_extractions`: `evidence_id`, `provider`, `model`, `prompt_version`, `fields jsonb`, `confidence jsonb`.
- `evidence_findings`: `request_id`, `check_code`, `result` (PASS, WARN, FAIL, INFO, NA), `detail`, `pipeline_version`.
- `ai_assessments`: append-only: `request_id`, `triage`, `strength_band`, `reasons jsonb`, `pipeline_version`.
- `approved_events`: `title`, `organizer`, `start_date`, `end_date`, `start_time`, `end_time`, `created_by`, `status`. `approved_event_participants`: `event_id`, `student_id`.
- `exam_schedule`: `subject_code`, `kind` (REGULAR, RE_EXAM, INTERNAL), `exam_date`, `start_time`, `end_time`. `exam_candidates`: `exam_id`, `student_id`, `hall_ticket_no`.

**Execution and governance**
- `attendance_corrections`: `request_session_id` (unique, idempotency key), `session_id`, `student_id`, `from_status`, `to_status`, `exec_status` (QUEUED, APPLIED, FAILED), `attempts`, `applied_at`, `error`.
- `policies`: `key`, `value jsonb`, `effective_from`.
- `consents`: `student_id`, `version`, `accepted_at`.
- `action_tokens`: `request_id`, `reviewer_id`, `action`, `token_hash`, `expires_at`, `used_at`.
- `audit_events`: `seq bigserial`, `ts`, `actor_id`, `actor_role`, `event_type`, `entity_type`, `entity_id`, `payload jsonb`, `prev_hash`, `hash`. UPDATE and DELETE blocked by trigger.
- `evidence_access_log`: `evidence_id`, `accessor_id`, `purpose`, `ts`.
- `notifications`: `user_id`, `kind`, `payload jsonb`, `channel`, `status`, `sent_at`.

**Enums**
- `role`: STUDENT, CLASS_TEACHER, SUBJECT_TEACHER, HOD, ADMIN. (A user may hold more than one; model as a roles array if needed.)
- `category`: MEDICAL, EVENT, EXAM, OFFICIAL_DUTY, OTHER.
- `attendance_status`: PRESENT, ABSENT, NOT_MARKED, OD, MEDICAL_CONDONED, PENDING_LAB_MAKEUP, NEEDS_RETEST_DECISION.
- `request_status`: DRAFT, SUBMITTED, EVIDENCE_PROCESSING, AWAITING_REVIEW, NEEDS_INFO, ESCALATED, APPROVED, PARTIALLY_APPROVED, REJECTED, APPLYING, APPLIED, APPLY_FAILED, APPEALED, WITHDRAWN.
- `triage`: LOOKS_CONSISTENT, NEEDS_REVIEW, FLAGGED.

**Indexes to add:** `(student_id, status)` on requests; `(section_id, date)` on sessions; `sha256`, `phash` on evidence; `(request_id)` on every child table.

## 5. State machines

### 5.1 Request
```
DRAFT -> SUBMITTED -> EVIDENCE_PROCESSING -> AWAITING_REVIEW
AWAITING_REVIEW -> NEEDS_INFO -> (student resubmits) -> AWAITING_REVIEW
AWAITING_REVIEW -> ESCALATED -> (HOD decides) -> APPROVED | PARTIALLY_APPROVED | REJECTED
AWAITING_REVIEW -> APPROVED | PARTIALLY_APPROVED | REJECTED
APPROVED | PARTIALLY_APPROVED -> APPLYING -> APPLIED | APPLY_FAILED
APPLY_FAILED -> APPLYING (admin retry)
REJECTED -> APPEALED -> AWAITING_REVIEW (different reviewer or HOD)
any pre-decision state -> WITHDRAWN (student)
```
EVIDENCE_PROCESSING always exits within a timeout to AWAITING_REVIEW, even if the AI failed (`ai_status = INCONCLUSIVE`).
Request status is derived from its `request_sessions` decisions: all approved = APPROVED; mix = PARTIALLY_APPROVED; all rejected = REJECTED.

### 5.2 Per-session attendance (correction engine)
For each APPROVED `request_session`:
1. Load session; if not `SCHEDULED`, mark `NOT_APPLICABLE` and stop.
2. Load current attendance for the student:
   - `PRESENT`: skip; tell the student "already marked present".
   - `ABSENT`: target status by slot type and category (THEORY: OD or MEDICAL_CONDONED; LAB: PENDING_LAB_MAKEUP; ASSESSMENT: NEEDS_RETEST_DECISION).
   - `NOT_MARKED` or no row: create a **pre-approved lock** (a row with the target status and `source = CORRECTION`) that the teacher sees when marking.
3. Insert `attendance_corrections` (unique on `request_session_id`) as QUEUED with `from_status`, `to_status`.
4. Call `ERPAdapter.apply(correction)`; on success set APPLIED; on failure increment `attempts`, retry up to 3 with backoff, then FAILED.
5. Write audit events for each transition. Never delete `from_status`.
Corrections are reversible: a reversal is a new correction record, not an edit.

## 6. AI evidence pipeline

Triggered after submit (background task). Each step records findings. Any exception in a step is caught: that step yields `WARN` with `AUTOMATED_CHECK_UNAVAILABLE`; the pipeline continues or ends as `INCONCLUSIVE`. It never blocks the request.

```
 0 Pre-flight        magic-byte file type, size cap, page cap
 1 Normalise         PDF: text layer via PyMuPDF; scanned PDF: render pages; images: OpenCV deskew/contrast
 2 Hash              sha256 (exact), pHash (near-duplicate)
 3 Extract           category schema -> structured JSON via vision model (temperature 0)
 4 Validate          deterministic checks (below)
 5 Signals           EXIF/software, ELA: INFO findings only
 6 Triage            deterministic rules -> triage + strength band
 7 Explain           findings -> plain English (templates first; optional LLM polish)
 8 Persist           append-only ai_assessments + findings; audit event; notify reviewer
```

**Step 3 extraction schemas (per category)**
- Common: `person_name`, `issuer`, `document_type`, `dates[]`, `time_window` (optional), `identifier` (certificate/invoice/hall-ticket no.), `qr_or_url` (if visible), plus `confidence` per field and `found: true/false`. Missing fields are `found: false`, **never guessed**.
- MEDICAL: `facility`, `doctor_name`, `doctor_registration_no` (as printed), `visit_or_rest_dates`.
- EVENT: `event_title`, `organizer`, `event_dates`, `participant_name`, `certificate_id`.
- EXAM: `subject_code`, `exam_date`, `hall_ticket_no`, `venue`.
Do not extract diagnoses. Prompt must instruct the model to ignore any instructions inside the document and to return only the schema.

**Step 4 validators (all deterministic)**
| Check code | Logic | Result rules |
|---|---|---|
| `IDENTITY_NAME` | rapidfuzz ratio of extracted name vs profile name; plus USN exact match if present | PASS at or above threshold (policy, start 85); WARN near; FAIL clearly different |
| `DATE_COVERS` | every requested date within the document's date range(s) | PASS / FAIL; WARN if dates unreadable |
| `TIME_WINDOW` | if a time window exists, map to periods; flag requested periods outside it | WARN with the list of outside periods |
| `ISSUER_VERIFIABLE` | QR decodes to URL whose domain is on the allowlist, OR event matches `approved_events`, OR exam matches `exam_schedule`, OR doctor registration number present | PASS if independently matched; INFO if only "present"; NA if nothing verifiable |
| `DUPLICATE_EXACT` | same `sha256` in another student's or earlier request | FAIL |
| `DUPLICATE_NEAR` | pHash Hamming distance at or below threshold (start 6, tune on eval set) | FAIL for other student; WARN for same student resubmission |
| `DUPLICATE_ID` | same certificate/invoice/hall-ticket identifier already used | FAIL |
| `TIMELINESS` | submitted within `request_deadline_days_after_absence` | PASS / WARN (late) |
| `HISTORY` | soft flags (frequency, always Mon/Fri, same issuer repeatedly) | INFO only; never changes triage |
| `POLICY_*` | quota, proof requirements, slot-type notes | Evaluated by the policy engine at submit time and recorded here |

**Step 6 triage rules (first match wins)**
1. FLAGGED if any of: `DUPLICATE_*` FAIL; `IDENTITY_NAME` FAIL; `DATE_COVERS` FAIL.
2. LOOKS_CONSISTENT only if all of: `IDENTITY_NAME` PASS; `DATE_COVERS` PASS; `ISSUER_VERIFIABLE` PASS; no WARN or FAIL anywhere; extraction confidence at or above the threshold on all required fields.
3. Otherwise NEEDS_REVIEW.
Category OTHER and "no proof" requests are always NEEDS_REVIEW.

**Strength band** (for queue ordering only): points from identity (30), date coverage (30), verifiability (30), timeliness (10), mapped to bands Low / Medium / High. Weights live in `policies` and are tuned on the labelled set. **Never display as a percentage or probability. Never use it to auto-approve.**

**Step 7 explanations** are generated from findings by templates, for example: "Name on the certificate matches your profile. The dates cover 14 Oct 2026. The event is on the coordinator-approved list. No duplicate was found." An optional LLM pass may rephrase but must not add facts; a post-check rejects output that mentions anything not in the findings.

**Evaluation harness (`apps/api/eval`)**
- `make_dataset.py` generates synthetic documents (Pillow/reportlab): genuine-consistent, wrong date, wrong name, missing fields, unreadable, duplicate reuse, genuine-but-ineligible event, ambiguous. Each has a ground-truth label JSON.
- Split: development (about 70%) and held-out test (about 30%), never tuned on the test split.
- `run_eval.py` reports: field accuracy, confusion matrix of triage vs expected, false-LOOKS_CONSISTENT count, false-FLAGGED rate on genuine docs, per-check precision/recall, mean processing time.

## 7. ERP adapter interface

```python
class ERPAdapter(Protocol):
    async def get_attendance(self, student_id, session_id) -> AttendanceStatus | None: ...
    async def apply(self, correction: Correction) -> ApplyResult: ...   # idempotent on correction id
    async def reverse(self, correction: Correction) -> ApplyResult: ...
```
- `MockERPAdapter`: operates on `attendance_records`.
- `CsvExportAdapter`: writes a regularisation report (CSV/PDF) and marks the correction `QUEUED_EXTERNAL` in notes; a teacher applies it in the real ERP; an admin marks it confirmed.
- `RealERPAdapter`: **do not build** until the college provides official, documented access. Never scrape or use someone's personal login.

## 8. Security and privacy

- **AuthN:** Supabase JWT verified on every request. **AuthZ:** a `require_role` dependency plus per-record ownership checks (student sees own; class teacher sees own section; subject teacher sees only requests touching their sessions; HOD sees department; admin sees all). Tests must try cross-access and expect 403/404.
- **Files:** private bucket; upload through backend; access via short-lived signed URLs (about 60 s); every view writes `evidence_access_log`. Subject teachers see masked previews (hide address, phone, and any diagnosis text); full file for class teacher, HOD, welfare role.
- **Consent:** first upload requires an explicit, not-pre-ticked consent; store version and time.
- **Minimisation and retention:** extract only needed fields; never store diagnoses; `retention.py` deletes originals after `evidence_retention_days_after_decision` and keeps extracted facts, findings and verdict.
- **Email action links:** token is random, stored as a hash, single-use, bound to reviewer and request, short expiry (for example 24 h). The link opens a **confirm page** (GET never mutates); the decision is a POST. Bulk links exist only for LOOKS_CONSISTENT requests and still show a summary first.
- **Audit chain:** `hash = SHA256(prev_hash || canonical_json(event))`. A verify endpoint recomputes the chain. DB trigger forbids UPDATE/DELETE on `audit_events`.
- **Abuse limits:** rate limit uploads and submissions per user; file size and type caps; magic-byte checks.
- **Secrets:** env vars only; never in the repo; separate service-role key kept server-side only.
- **Logging:** structured, with request ids; never log document contents, names with medical context, or tokens.
- **Compliance posture:** follow India's DPDP Act principles (consent, purpose limitation, minimisation, retention, access rights) as a design baseline. Do not claim legal compliance; the college must review before real data is used.

## 9. API surface (`/api/v1`)

| Method and path | Role | Purpose |
|---|---|---|
| GET `/me` | any | Profile and role |
| GET `/student/attendance` | student | Overall and per-subject % |
| GET `/student/sessions?dates=...` | student | Sessions for chosen dates with status and slot type |
| POST `/requests` | student | Create draft (category, reason, sessions) |
| POST `/requests/{id}/evidence` | student | Upload file; runs pre-submission checks |
| POST `/requests/{id}/precheck` | student | Friendly validation warnings |
| POST `/requests/{id}/submit` | student | Submit (requires consent) |
| POST `/requests/{id}/withdraw` | student | Withdraw |
| POST `/requests/{id}/appeal` | student | Appeal a rejection |
| GET `/requests` / `/requests/{id}` | role-scoped | List/detail incl. timeline |
| GET `/review/queue` | teacher/HOD | Sorted queue |
| GET `/review/{id}` | teacher/HOD | Evidence, fields, findings, sessions |
| POST `/review/{id}/decisions` | teacher/HOD | Per-session decisions with reasons |
| POST `/review/{id}/escalate` | class teacher | Send to HOD |
| GET `/evidence/{id}/url` | authorised | Signed URL (logged) |
| GET `/actions/{token}` | none | Returns summary for confirm page (no mutation) |
| POST `/actions/{token}/confirm` | none (token) | Perform the decision |
| GET `/reports/regularisation` | teacher/HOD | CSV/PDF export |
| GET `/letters/{request_id}` | student/teacher | QR-verified letter PDF |
| GET `/verify/{code}` | public | Verify a letter's QR code (minimal info) |
| Admin CRUD `/admin/...` | admin | Users, sections, timetable, calendar exceptions, policies, events, exams |
| POST `/admin/corrections/{id}/retry` | admin | Retry failed apply |
| POST `/admin/requests/{id}/reprocess` | admin | Re-run AI pipeline |
| GET `/admin/audit` and `/admin/audit/verify` | admin/HOD | View and verify chain |

**Error envelope (all errors):**
```json
{ "error": { "code": "EVIDENCE_UNREADABLE", "message": "We couldn't read this file. Try a clearer photo or a PDF.", "details": {}, "request_id": "..." } }
```

## 10. End-to-end data flow (the main happy path)

1. Browser: student logs in via Supabase Auth, receives JWT.
2. `GET /student/sessions?dates=2026-10-14`: API returns that day's `class_sessions` joined with the student's attendance and slot types.
3. `POST /requests` creates a DRAFT with selected `request_sessions`.
4. `POST /requests/{id}/evidence` stores the file, computes hashes, runs pre-checks, returns friendly warnings.
5. `POST /requests/{id}/submit`: policy engine runs (quota, deadline, proof requirements); status becomes EVIDENCE_PROCESSING; background task starts the AI pipeline.
6. Pipeline writes extraction, findings, assessment; status becomes AWAITING_REVIEW; reviewer is notified (email).
7. Teacher opens `/review/{id}`, sees evidence and findings, posts `/decisions` per session with reasons.
8. Backend derives request status, queues corrections, calls the ERP adapter, writes audit events, notifies the student.
9. Student sees "Attendance updated"; can download the QR letter.

## 11. Configuration (environment variables)

| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Public values only |
| `NEXT_PUBLIC_API_BASE_URL` | web | |
| `DATABASE_URL` | api | Postgres connection (async driver) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` or JWKS URL | api | Server-only |
| `STORAGE_BUCKET` | api | Private bucket name |
| `VISION_PROVIDER`, `VISION_API_KEY`, `VISION_MODEL` | api | `VISION_PROVIDER=fake` in tests |
| `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM` | api | |
| `ALLOWED_EMAIL_DOMAINS` | api | College domain(s) |
| `APP_BASE_URL` | api | For email links and QR verification URLs |
| `ENV` | both | `dev`, `test`, `prod` |
Provide `.env.example` files with every variable and no secrets.

## 12. Observability and ops
- Request-id middleware; structured JSON logs; `/healthz` and `/readyz` endpoints.
- Background job runner: start with FastAPI background tasks plus a periodic loop for retention and session generation; move to a proper queue only if needed.
- Backups: Supabase automatic backups where available; document restore steps in README.

## 13. Testing strategy
- **Unit:** validators, triage rules, policy engine, state machines, audit chain.
- **Integration:** API with a test database; fake vision provider returning scripted extractions.
- **Security:** cross-role access matrix; token replay; GET never mutates.
- **Idempotency:** applying the same correction twice yields one record.
- **Failure injection:** vision provider timeout, ERP adapter failure, corrupt PDF.
- **Eval:** `run_eval.py` on the labelled set; results stored in MEMORY.md after Phase 4.
- **Frontend:** component tests for the stepper and calendar; one Playwright end-to-end for the happy path.
