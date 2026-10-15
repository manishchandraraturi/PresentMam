# MEMORY.md: PresentMam

This file is the project's long-term memory for AI agents. It exists so a fresh session never has to guess what was built, what was decided, or what is still unknown.

**Protocol**
1. Read this file at the start of every session, right after RULES.md.
2. When a phase's Exit check passes, **append a Phase Log entry before doing anything else** (template in section 5).
3. Only record things that are true and verified. Paste real test and lint results. Never write "should work".
4. Keep entries short and factual. Do not delete old entries; mark them superseded.
5. If memory and code disagree, trust the code, then fix this file and note the correction.

---

## 1. Project snapshot
- **Name:** PresentMam. Tagline: "Life happened. Let's fix the paperwork."
- **What:** AI-assisted attendance regularisation for CMR Institute of Technology (CMRIT) students and faculty. Student submits one request for one or more missed dates with proof; AI extracts and checks the proof and gives the reviewer a plain-English triage; a human decides per session; approved sessions become audited, reversible attendance corrections.
- **Owner:** Manish Raturi, 3rd-year AIML student at CMRIT.
- **Build tool:** Antigravity (agentic IDE). Docs live in repo root: PRD.md, ARCHITECTURE.md, RULES.md, DESIGN.md, TASKS.md, MEMORY.md.
- **Stage:** prototype using synthetic data and a simulated ERP.

## 2. Phase status
| Phase | Name | Status | Completed on |
|---|---|---|---|
| 0 | Foundations | NOT STARTED | n/a |
| 1 | Data model, auth, roles, seed | NOT STARTED | n/a |
| 2 | Student experience without AI | NOT STARTED | n/a |
| 3 | Faculty workflow, policy, corrections, audit | NOT STARTED | n/a |
| 4 | AI evidence pipeline and evaluation | NOT STARTED | n/a |
| 5 | Notifications, appeals, privacy, analytics | NOT STARTED | n/a |
| 6 | Polish, pilot readiness, demo | NOT STARTED | n/a |
| 7 | Optional extensions | NOT STARTED | n/a |

**Current phase:** 0 (not started)
**Next task:** P0-T1

## 3. Locked decisions
| ID | Decision | Why |
|---|---|---|
| D-001 | AI assists, humans decide. AI never approves, rejects, or writes attendance. | Liability, fairness, HOD trust |
| D-002 | No "fake detection" claims. AI does extraction; deterministic code does validation, duplicates, triage. | Forgery detection is unreliable; explainability |
| D-003 | Metadata/ELA signals are INFO only and never decide triage. | Genuine certificates are often made in Canva/Photoshop or are screenshots |
| D-004 | Triage by deterministic rules; strength band used only for queue ordering; never shown as a percentage. | Avoid hallucinated or meaningless scores |
| D-005 | Evidence findings and policy eligibility are separate checks. | A real certificate does not equal an eligible absence |
| D-006 | One request covers many dates and sessions; per-session decisions allow partial approval. | Removes five-times repetition; realistic outcomes |
| D-007 | Approval and execution are separate states; idempotent corrections keyed by `request_session_id`; reversal is a new record. | Failures must not corrupt or hide state |
| D-008 | ERP is behind an adapter. Mock now; CSV/PDF report and QR letter as the bridge. No real adapter or scraping without official access. | No assumed API; safety |
| D-009 | All business logic and data access go through FastAPI; Supabase used for Auth, DB, Storage; RLS deny-by-default. | Single enforcement point |
| D-010 | Policy values live in the `policies` table. PRD numbers marked placeholder are not confirmed college rules. | Unknown real rules |
| D-011 | Email action links open a confirm page; only POST mutates; single-use hashed tokens. | Email scanners prefetch GET links |
| D-012 | Audit log is append-only and hash-chained, with a verify endpoint. | Accountability |
| D-013 | Slot types: THEORY becomes OD/medical; LAB becomes PENDING_LAB_MAKEUP; ASSESSMENT is not auto-granted. | Missing a lab or test is not equivalent to missing a lecture |
| D-014 | Provisional or GPS-based auto-attendance is out of MVP; any later version is policy-gated, off by default, teacher-visible. | GPS is spoofable; avoid silent grants |
| D-015 | Design: deep-teal base with multi-colour palette, glass for floating/key layers, Bricolage Grotesque plus Figtree, student mood playful and faculty mood calm. | Brief asked for funky, glassy, not template-looking |
| D-016 | Vision provider is behind an interface; model name from env; default adapter Gemini API; tests use a fake provider. | Swappable; no hard-coded model names |
| D-017 | Student-side threshold default is 85% (configurable). | Stated by the owner; confirm with college |

## 4. Open questions and unverified items
| ID | Question | Owner | Status |
|---|---|---|---|
| Q-001 | Real CMRIT/university rules: attendance minimum, OD cap, medical relaxation, deadlines, who approves what | HOD or college office | OPEN |
| Q-002 | Does the college ERP expose an API or import format? | IT admin | OPEN |
| Q-003 | College email domain for sign-in | Owner | OPEN |
| Q-004 | Which class teacher and HOD will pilot | Owner | OPEN |
| Q-005 | Current free-tier limits of Supabase, Vercel, Render/Railway, vision provider | Agent to verify at deploy time | OPEN |
| Q-006 | Current official package and model names for the vision provider SDK | Agent to verify in docs at P4-T1 | OPEN |

Do not answer these by guessing. Record the answer here when the human provides it, and update the policy table or config accordingly.

## 5. Phase Log (append one entry per completed phase)

### Entry template (copy this)
```
### Phase N: <name>  |  Completed: YYYY-MM-DD  |  Branch/commit: <ref>
**Built:** <modules, screens, endpoints, tables>
**Key files:** <paths>
**Decisions made this phase:** <D-0xx added or changed, with why>
**Schema or API changes:** <migrations added, endpoints added/changed>
**Env vars added:** <names only, no values>
**Dependencies added:** <name, version, why>
**Tests:** <command run and real result summary, e.g. "pytest: 143 passed, 0 failed; ruff clean; mypy clean">
**Eval results (Phase 4 only):** <real numbers from run_eval.py and report path; stated limitations>
**Known issues and gotchas:** <anything the next session must know>
**Deviations from docs:** <what differs from PRD/ARCHITECTURE/DESIGN and why>
**Open questions raised:** <new Q-0xx>
**Next phase notes:** <what to start with, any prerequisite>
```

### Log
(No phases completed yet.)

## 6. Verified facts (agent adds as discovered)
Record environment facts after verifying them: installed versions, working commands, URLs of deployed apps (non-secret), table counts after seeding, etc.

(none yet)

## 7. Known issues and gotchas
Record problems that took more than two attempts to solve, and the cause.

(none yet)

## 8. Glossary
- **Regularisation:** correcting an absence record after approval.
- **OD:** on duty.
- **Triage:** Looks consistent / Needs review / Flagged.
- **Session:** a scheduled class period on a date for a section.
- **Correction:** an audited, reversible attendance change tied to one approved request-session.
- **ERP adapter:** component that applies corrections to an attendance system.
