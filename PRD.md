# PRD.md: PresentMam

**AI-assisted attendance regularisation for colleges**
Tagline: "Life happened. Let's fix the paperwork."

Version 1.0 | 14 Oct 2026 | Owner: Manish Raturi (3rd-year AIML, CMR Institute of Technology, Bengaluru) | Status: ready for Phase 0

> Read order for any AI agent: RULES.md, PRD.md, ARCHITECTURE.md, DESIGN.md, TASKS.md, MEMORY.md.
> This PRD merges the original idea with five independent reviews (assistant professor, class teacher, HOD, student, hackathon judge perspectives). Every concern raised in those reviews is listed in section 12 with its resolution and where it is specified.

---

## 1. What we are building

PresentMam is a web app where a student who missed classes for a legitimate reason (hackathon, workshop, medical leave, re-exam or back paper, official duty) submits **one request** for one or more dates, attaches proof, and tracks it to completion. An AI pipeline reads the proof, checks it against the student's profile, the timetable, and college policy, and gives the reviewing teacher a **plain-English recommendation with reasons**. The teacher or HOD makes the final decision in one screen. Only after human approval does the system create a traceable, reversible attendance correction.

**One-sentence definition:** PresentMam replaces "letter, five signatures, five cabin visits" with "one request, one review, one audit trail", and AI does the boring checking, never the deciding.

### What it is NOT (read this twice)
- It is NOT an AI that marks students present on its own.
- It is NOT a forgery detector. It cannot prove a document is real. It checks consistency, finds anomalies, and flags duplicates.
- It is NOT a replacement for the college ERP. In the prototype it runs against a simulated ERP (a mock database). Real ERP write access only comes with official college permission.
- It is NOT a way around attendance policy. Policy rules run first and are configurable by admins.

---

## 2. The problem we are solving

Today, a student who misses a day for a valid reason must:
1. Write a leave letter and attach proofs.
2. Get the class teacher's signature (show proof).
3. Get the HOD's signature (show proof again).
4. Visit every subject teacher (about five per day, per day missed) so each opens the ERP and marks attendance date by date.

Costs: roughly two hours of student effort spread across days; teachers repeatedly verifying the same document; inconsistent decisions; no record of who approved what or why; students at risk of falling below the minimum attendance (the student-stated threshold is 85%; configurable).

**Who feels it:** students (chasing), class teachers (repeated verification), subject teachers (interruptions), HODs (no visibility, no audit trail).

---

## 3. Target users and personas

| Persona | Needs | Pain today | What PresentMam gives them |
|---|---|---|---|
| **Student** (e.g. Manish, 3rd-year AIML) | Fast, fair, transparent way to regularise genuine absences | Chasing 5 teachers plus signatures; fear of shortage | 3-minute request, live status, clear reasons for any rejection, fair appeal |
| **Class teacher** | Quick review, full evidence visibility, protection from liability | Repeated verification, WhatsApp pings, accountability if a fake slips through | One queue, evidence plus extracted facts plus reasons, final say, override with notes |
| **Subject teacher** | Know which of their sessions are affected; no interruptions | Students appearing between classes | Read-only view of affected sessions, optional flag/objection |
| **HOD** | Policy compliance, accountability, exceptions oversight | No audit trail, risk of misuse | Escalation queue, exception report, random audit pull, immutable history |
| **Admin / faculty coordinator** | Configure sections, timetable, policy; pre-approve events | Manual lists | Admin panel, policy config, approved-event participant lists |
| **Evaluators** (professor, hackathon judges) | Real AIML contribution, measurable results, honest limits | "Is this just a form plus an API call?" | Evaluated AI pipeline, metrics, failure-case demo |

Primary users at launch: students of one section plus that section's class teacher and HOD (pilot).

---

## 4. Goals and non-goals

### Goals (MVP)
- G1. One request can cover multiple dates and all affected sessions.
- G2. Student request takes about 3 minutes and shows live status.
- G3. Teacher reviews a request in under 1 minute using one consolidated screen.
- G4. AI produces an explainable triage (Looks consistent / Needs review / Flagged) and never takes the final decision.
- G5. Every attendance change is authorised, reversible and auditable (who, when, why, proof hash, AI findings, before/after).
- G6. Policy (slot types, quotas, deadlines, required proof per category) is enforced by rules, not by the AI.
- G7. AI quality is measured on a labelled test set and reported honestly.
- G8. Privacy by design for medical documents (consent, minimisation, access control, retention).

### Non-goals (MVP)
- Real ERP write integration or scraping the ERP with anyone's credentials.
- Face recognition, biometrics, GPS-based auto-attendance.
- Training a custom forgery model from scratch.
- Native mobile apps (responsive web only; it must work great on phones).
- Payments, parent portal, multi-college tenancy.

---

## 5. Product principles (non-negotiable)

1. **AI assists, humans decide.** Rejection and approval are always human actions.
2. **Evidence is not eligibility.** "The certificate looks consistent" and "college policy allows this" are separate checks, shown separately.
3. **No silent changes.** Every correction needs approval, confirmed execution, and a history entry.
4. **Explain everything.** Students and reviewers always see why.
5. **Uncertainty is visible.** When the system is unsure, it says so and routes to a human.
6. **The AI never blocks a student.** Any AI failure or doubt leads to human review, not rejection.
7. **Use the simplest tool that works.** Deterministic code for dates, names, duplicates and policy; AI only for reading documents and (optionally) wording explanations.
8. **Fun on the student side, calm on the faculty side.**

---

## 6. Feature list

Priority: **M** = must (MVP), **S** = should, **C** = could (post-MVP). Phase refers to TASKS.md.

### 6.1 Student
| ID | Feature | Pri | Phase |
|---|---|---|---|
| S1 | Login with college email (role-aware redirect) | M | 1 |
| S2 | Dashboard: overall and per-subject attendance %, threshold ring, shortage warning | M | 2 |
| S3 | **"Attendance Dedo" flow**: playful entry button that starts a request | M | 2 |
| S4 | Multi-date calendar selection | M | 2 |
| S5 | Period-level picker: shows that day's real sessions (from timetable), flags Lab / Internal Assessment slots, greys out sessions already marked present or cancelled | M | 2 |
| S6 | Reason categories: Medical, Workshop/Hackathon/Competition, Exam (re-exam/back paper/internal), Official duty, Family emergency/Other | M | 2 |
| S7 | Proof upload with **pre-submission validation** (readable? right dates? duplicate? missing field?) with friendly warnings, not accusations | M | 4 |
| S8 | Consent screen (not pre-ticked) before first upload | M | 5 |
| S9 | "No proof available" path that routes to teacher review | M | 2 |
| S10 | Live status timeline (Submitted, Checking, With teacher, Approved, Applied) | M | 2 |
| S11 | Clear rejection or "more info" reason; resubmit corrected proof; appeal | M | 5 |
| S12 | Request history and downloadable QR-verified leave letter | S | 3 |
| S13 | Shortage planner: "you can miss N more classes in DBMS" | S | 5 |
| S14 | Team request for hackathons (one request for teammates) | C | 7 |

### 6.2 Faculty
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F1 | Review queue sorted by triage then age; filter by status/category | M | 3 |
| F2 | Review screen: proof viewer, extracted fields (mismatches highlighted), findings with plain reasons, affected sessions grouped by subject | M | 3 |
| F3 | Per-session decisions: approve, reject, request info, escalate to HOD (supports partial approval) | M | 3 |
| F4 | Mandatory reason on every decision | M | 3 |
| F5 | Override: AI recommendation stays in history when a human disagrees | M | 3 |
| F6 | Email action links (single-use, confirm-page, never GET-mutating) | S | 5 |
| F7 | Bulk approve only for requests tied to coordinator-approved events or fully verified low-risk items, always with confirmation | S | 5 |
| F8 | Regularisation report export (CSV/PDF) for manual ERP entry | M | 3 |
| F9 | HOD dashboard: pending, escalations, exception report, analytics, **random audit pull** | S | 5 |
| F10 | Subject-teacher read-only view and optional objection flag | S | 5 |
| F11 | Faculty coordinator uploads approved event with participant list (removes proof need for those students) | S | 5 |

### 6.3 Admin
| ID | Feature | Pri | Phase |
|---|---|---|---|
| A1 | Manage departments, sections, students, teachers, subjects, timetable, calendar exceptions (holidays, cancelled classes) | M | 1 |
| A2 | Policy configuration (see section 8) with effective dates | M | 3 |
| A3 | Attendance-change cutoff freeze per semester | S | 5 |
| A4 | Audit log viewer with integrity check | M | 3 |
| A5 | Reprocess a request through the AI pipeline | S | 4 |

### 6.4 System
| ID | Feature | Pri | Phase |
|---|---|---|---|
| Y1 | AI evidence pipeline: extract, validate, triage, explain | M | 4 |
| Y2 | Duplicate detection: file hash, perceptual hash, certificate/invoice ID uniqueness | M | 4 |
| Y3 | Policy engine (slot types, quotas, deadlines, proof requirements) | M | 3 |
| Y4 | Attendance-correction state machine with ERP adapter (Mock now) and idempotent execution | M | 3 |
| Y5 | Append-only, hash-chained audit log | M | 3 |
| Y6 | Retention job (delete originals after N days, keep extracted facts and verdict) | M | 5 |
| Y7 | Notifications (email first) | S | 5 |
| Y8 | Evaluation harness with labelled dummy documents | M | 4 |

---

## 7. Core user flows

### 7.1 Student request (happy path)
1. Student opens dashboard, sees overall attendance dropping toward the threshold.
2. Taps **Attendance Dedo**.
3. **Step 1, Dates:** picks 14 Oct 2026 on the calendar. The app lists that day's real sessions for the student's section.
4. **Step 2, Sessions:** all missed sessions pre-ticked; Lab and Internal Assessment sessions carry a tag with a short explanation of what will happen to them.
5. **Step 3, Reason and proof:** chooses Workshop; writes a short description; uploads the participation certificate. Pre-submission checks run and show friendly warnings if something looks off.
6. **Step 4, Review and submit:** summary plus consent (first time). Submits.
7. Timeline: Submitted, Checking proof, With class teacher, Approved, Attendance updated.

### 7.2 Teacher review
1. Queue shows requests sorted by triage and age. Each row has a one-line summary.
2. Review screen shows proof beside extracted fields, findings in plain English, and the affected sessions grouped by subject.
3. Teacher approves, rejects with reason, requests more info, or escalates to HOD (per session if needed).
4. Approved sessions enter the correction pipeline: queued, applied (mock ERP), confirmed. Student is notified.

### 7.3 Failure paths (must be demoable)
- AI unavailable: request still reaches the teacher, marked "automated check unavailable".
- Proof unreadable: student gets an actionable message (re-upload) before submission.
- Duplicate proof: flagged to teacher with the matching request reference (not the other student's identity unless the viewer is authorised).
- Apply step fails: approval stays; status shows "update needs reconciliation"; admin can retry.

---

## 8. Business rules and policy (configurable defaults)

> **IMPORTANT:** the numbers below marked (placeholder) are NOT confirmed CMRIT or university rules. They must live in the `policies` table and be confirmed with the HOD or college office before any real use. The AI agent must never hard-code them.

| Key | Default | Notes |
|---|---|---|
| `min_attendance_percent` | 85 | Student-stated threshold; confirm |
| `od_quota_per_semester` (days) | 6 (placeholder) | Applies to Workshop/Event/Official-duty category |
| `medical_relaxation_max_percent` | 10 (placeholder) | Medical bucket tracked separately from OD |
| `request_deadline_days_after_absence` | 7 (placeholder) | After deadline: allowed but flagged "late" |
| `evidence_retention_days_after_decision` | 90 | Original files deleted; extracted data and verdict kept |
| `soft_flag_requests_per_month` | 3 | Flags for review; never blocks |
| `ai_auto_approve` | false | Must stay false in MVP |

**Slot-type rules (applied per session):**
| Slot type | Behaviour on approval |
|---|---|
| THEORY | Status becomes `OD` or `MEDICAL_CONDONED` |
| LAB | Status becomes `PENDING_LAB_MAKEUP`; teacher is told a make-up experiment is needed |
| ASSESSMENT (internal test) | Not auto-granted; session is marked `NEEDS_RETEST_DECISION` for the teacher |

**Proof requirements by category (defaults):**
| Category | Required proof | Verifiable against |
|---|---|---|
| Medical | Doctor/hospital document with patient name and dates | Name/date match, required fields, doctor registration number present (format check only) |
| Workshop/Hackathon | Certificate, registration email, or event pass | Name/date/time match, QR/URL if present, coordinator-approved events |
| Exam (re-exam/back paper) | Hall ticket | College exam schedule (internal) |
| Official duty | Duty letter | Faculty duty list |
| Family emergency/Other | Optional | Always human review |

**Attendance state hierarchy:** `PRESENT` (already marked) is never overwritten and the student is told so; `ABSENT` can become `OD`, `MEDICAL_CONDONED` or `PENDING_LAB_MAKEUP` with before/after logged; `NOT_MARKED` creates a pre-approved lock the teacher sees when they mark that session. Cancelled, rescheduled or holiday sessions are never corrected.

---

## 9. AI scope (honest version)

**What AI does:** reads documents (PDF text layer first, vision model for images and scans), extracts structured fields per category, and (optionally) polishes wording of explanations that are generated from findings.

**What deterministic code does:** identity match (fuzzy name plus USN), date and time coverage, period mapping, duplicate detection, QR/URL/event/exam cross-checks, timeliness, policy rules, triage colour.

**What AI never does:** approve, reject, write attendance, decide eligibility, or claim a document is "genuine" or "fake".

**Outputs:** triage (Looks consistent / Needs review / Flagged), an evidence-strength band for queue sorting (never shown as a probability), findings with plain reasons.

**Metadata and image-forensics signals (EXIF, error-level analysis)** are informational only. Many genuine certificates are made in Canva or Photoshop, and screenshots strip metadata, so these signals never turn a request red by themselves.

---

## 10. Success metrics

| Metric | How measured | Target (goal, not a claim) |
|---|---|---|
| Student effort per request | Timed pilot vs paper-style baseline | Report the measured number; do not invent one |
| Reviewer time per request | Timed pilot | Report measured number |
| Field extraction accuracy | Labelled dummy set, held-out split | Report per field |
| False-GREEN rate on tampered or mismatched docs | Labelled test split | Aim for zero on the test set; report honestly |
| False-flag rate on genuine docs | Labelled test split | Keep low; report honestly |
| Human-AI agreement | Reviewer decisions vs recommendation | Report |
| Requests with a complete audit trail | Audit integrity check | 100% |
| Duplicate-correction incidents | Idempotency tests | 0 |

---

## 11. Demo script (judges and viva)

1. Log in as Manish; show attendance ring near the threshold.
2. Tap Attendance Dedo; pick 14 Oct 2026; sessions load; Lab and IA tags visible.
3. Choose Workshop; upload a participation certificate; pre-submission check passes.
4. Submit; show timeline; show teacher queue with "Looks consistent" and plain reasons.
5. Teacher approves in one click; correction applies in the mock ERP; student sees "Attendance updated".
6. Open audit log: proof hash, findings, approver, rule, before/after.
7. Failure cases: date-mismatch certificate; duplicate proof from another student; AI switched off; Lab session with partial approval; back-paper via hall ticket.

---

## 12. Reviewer concerns and how this product resolves them

| # | Concern (who raised it) | Resolution | Specified in |
|---|---|---|---|
| C1 | "Where is the actual AI? Just CRUD plus an API call." (professor) | Defined multi-stage pipeline plus evaluation harness with labelled data | ARCH 6, TASKS P4 |
| C2 | "How will you prove it works?" (professor) | Labelled dummy dataset, dev/test split, reported metrics | TASKS P4 |
| C3 | AI score might be hallucinated (professor) | Triage computed by deterministic rules; LLM only extracts fields; explanations built from findings | ARCH 6 |
| C4 | Forgery detection is unrealistic (all) | Reframed to consistency checks, anomaly flags, duplicate detection; metadata informational only | PRD 9 |
| C5 | OCR fails on handwriting (professor, teacher) | PDF text layer first; vision model for images; low confidence leads to human review | ARCH 6 |
| C6 | Teacher still checks five subjects (teacher) | One request covers all sessions; consolidated review grouped by subject | PRD 7, ARCH 4 |
| C7 | Students upload junk (teacher) | Pre-submission validation with friendly warnings | PRD S7 |
| C8 | Genuine proof does not equal policy eligibility (teacher) | Evidence and eligibility separated in code and UI | PRD principle 2 |
| C9 | Teacher disagrees with AI (teacher) | Override with reason; AI recommendation preserved in history | PRD F5 |
| C10 | Too many alerts, new portal fatigue (teacher) | Exception-first queue; email action links; batch only when safe | PRD F1, F6, F7 |
| C11 | Liability if AI is wrong (teacher, HOD) | Humans approve; every decision logged with approver identity | PRD principle 1, ARCH audit |
| C12 | Unauthorised attendance changes (HOD) | Role-based access enforced server-side; students cannot touch attendance; only approved corrections are applied | ARCH 8 |
| C13 | Student abuse: fake, duplicate, recycled proofs (HOD, teacher) | Hash and perceptual-hash duplicates, certificate ID uniqueness, history flags, human review | ARCH 6 |
| C14 | Unfair rejection of genuine students (HOD, student) | AI never rejects; uncertainty goes to a human; appeal path; varied formats tested | PRD principle 6 |
| C15 | AI outage blocks everything (HOD) | Fallback: request proceeds as "automated check unavailable" | ARCH 6, RULES 6 |
| C16 | Audit and accountability (HOD) | Append-only hash-chained audit log; corrections store before/after | ARCH 5 |
| C17 | Policy compliance (HOD) | Configurable policy engine; placeholders clearly marked; confirm with HOD | PRD 8 |
| C18 | Lab or internal test treated like theory (HOD) | Slot-type rules per session | PRD 8 |
| C19 | OD abuse across the semester (HOD) | Semester quotas tracked per bucket with exception path | PRD 8 |
| C20 | Back-paper has no certificate (HOD) | Hall ticket matched to internal exam schedule | PRD 8 |
| C21 | Medical privacy, DPDP-type obligations (HOD, all) | Consent, minimisation, access control, signed URLs, retention job | ARCH 8 |
| C22 | ERP integration unrealistic (HOD, admin) | Adapter interface; Mock now; CSV/PDF report and QR letter; real adapter only with official access | ARCH 7 |
| C23 | Partial-day absence (teacher) | Period-level picker; event time window restricts eligible periods | PRD S5 |
| C24 | Already marked present or marked late in ERP (professor) | Attendance state hierarchy, no overwrite of PRESENT, NOT_MARKED lock | PRD 8 |
| C25 | Cancelled or rescheduled class (admin) | Corrections only against real `class_sessions` with status SCHEDULED | ARCH 4 |
| C26 | Approved but ERP update fails (admin) | Approval and execution are separate states; idempotent retries; FAILED is visible | ARCH 4 |
| C27 | Certificate arrives weeks later (student) | Late-proof flow: request stays open as "awaiting certificate" with a deadline; teachers can see the pending context (provisional auto-grant is a post-MVP, policy-gated option only) | PRD, TASKS P7 |
| C28 | Teacher never opens the app (student) | Email action links, reminders, auto-escalation to HOD after a set time | ARCH 3, TASKS P5 |
| C29 | Student cannot see why they were rejected (student) | Verification report with specific reasons on every request | DESIGN, PRD S11 |
| C30 | Too complicated to submit (student) | Four-step guided flow, data auto-filled from profile and timetable | PRD 7.1 |
| C31 | Marketing implies guaranteed attendance (HOD) | Copy promises a process, never an outcome | DESIGN microcopy |
| C32 | Novelty unclear vs ordinary leave portals (judge) | Differentiators: multi-session requests, evidence/eligibility separation, explainable triage, audited corrections, measured results | PRD 1, 10 |
| C33 | Time saved is unproven (judge) | Small timed pilot against a baseline; report real numbers only | PRD 10 |
| C34 | Scope too large to finish (judge) | Phased plan; smallest complete product first; AI after workflow works | TASKS |
| C35 | Prompt injection through uploaded documents | Document text is untrusted data; extraction output validated against schema; instructions inside documents are ignored | RULES 3 |
| C36 | Email scanners trigger approval links | Links open a confirm page; only POST mutates; tokens single-use, short-lived | ARCH 8 |
| C37 | Maintenance after graduation (HOD) | Simple stack, docs, MEMORY.md, handover checklist | TASKS P6 |

### Residual risks we accept (honest list)
- A skilled forger can still produce a consistent-looking fake. Mitigation: human review for anything not independently verifiable, duplicate detection, audits.
- Real CMRIT policy values and ERP access are unknown until the college confirms. Mitigation: all policy is config; ERP is behind an adapter.
- Vision-model extraction can misread a document. Mitigation: confidence thresholds, human verification, correction UI.
- Adoption depends on one willing class teacher and HOD. Mitigation: pilot with a single section.

---

## 13. Assumptions and open questions

| ID | Item | Status |
|---|---|---|
| Q1 | Actual CMRIT/university attendance, OD and medical rules (numbers in section 8) | Open: ask HOD or office |
| Q2 | Does the ERP expose an API or an import format? | Open: ask IT admin |
| Q3 | College email domain for sign-in | Open: set `ALLOWED_EMAIL_DOMAINS` |
| Q4 | Which teacher/HOD will pilot | Open |
| Q5 | Who approves: class teacher alone, or class teacher then HOD, by category | Default: class teacher; HOD for escalations and medical beyond the relaxation cap; configurable |
| A1 | MVP uses dummy data only; no real student documents | Assumed |
| A2 | Free-tier hosting is acceptable for the prototype | Assumed; check current limits |

## 14. Glossary
- **Regularisation:** correcting an absence record after approval (OD, medical condonation).
- **OD:** on duty (college-approved external activity).
- **Triage:** Looks consistent / Needs review / Flagged, a recommendation for the human reviewer.
- **Session:** one scheduled class period on one date for one section.
- **ERP adapter:** the component that applies approved corrections to an attendance system.
