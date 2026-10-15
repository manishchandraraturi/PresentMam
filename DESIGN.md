# DESIGN.md: PresentMam

Version 1.0 | 14 Oct 2026
Brief in one line: a funky, glassy, colourful app that students actually want to open, and a calm, clear workspace for the teachers who review their requests. Clean, spacious, minimal, smooth. It must not look like a template or like AI-generated output.

---

## 1. Design intent

**Subject:** attendance paperwork, the most dreaded admin task in a student's week.
**Audience:** college students on phones, between classes (primary); teachers and HODs on laptops (secondary, calm mode).
**Primary job of the UI:** make a stressful chore feel quick, honest, and slightly funny, then get out of the way.

**The one memorable thing (spend boldness here, keep everything else quiet):**
1. The **Attendance Ring** on the student home screen: a big, animated, colour-shifting ring that shows overall attendance against the college threshold.
2. The **Attendance Dedo button**: a chunky, sticker-style call to action with a hand-drawn crying face that wobbles when touched.
Everything else (lists, forms, tables) is disciplined and plain so these two moments land.

**Two moods, one system**
- **Student side:** playful, glassy, saturated, big type, sticker details.
- **Faculty and admin side:** same tokens, calmer. Light theme by default, denser layouts, almost no ambient motion, glass used only for floating layers (sheets, popovers).

## 2. Design plan review (what we avoided on purpose)

Generated UIs cluster around a few looks. We checked this brief against them and chose differently:
- Not a near-black base with one acid-green accent. Our base is deep teal with **several** deliberate colours used by role (action, fun, success, caution, danger).
- Not cream paper plus serif plus terracotta. Our light theme is cool sea-glass.
- Not a purple-to-blue gradient hero. Ambient colour comes from teal, tangerine, bubblegum and cobalt orbs.
- Not identical rounded cards with the same radius and shadow everywhere. Radius and elevation change with hierarchy (section 6).
- Not tracked-out ALL-CAPS eyebrows above every heading, not middle-dot meta strings, not "WORD: fragment" labels, not arrows on buttons, not a monospace face for every small label.
- Not fade-and-slide-up on every section and hover lift on every card. Motion appears in one orchestrated entrance and in response to the user's actions.
- Not one-word accent highlighting inside headlines.
- Numbered markers appear only where the content really is a sequence (the request stepper and the status timeline).

## 3. Colour tokens

All colours are CSS variables in `styles/tokens.css`. Components never use raw hex.

**Core palette (named)**
| Name | Hex | Role |
|---|---|---|
| Lagoon | `#0A2A33` | Dark base |
| Lagoon Raised | `#0F3A45` | Dark raised surface |
| Sea Glass | `#EDF5F6` | Light base |
| Tangerine | `#FF8A3D` | Primary action |
| Bubblegum | `#FF6FB1` | Fun accent: stickers, highlights, celebratory moments |
| Cobalt | `#4C7DFF` | Information, links, focus |
| Mint | `#36E0B0` | Success, "Looks consistent" |
| Sunny | `#FFD23F` | Caution, "Needs review" |
| Cherry | `#FF5A5F` | Danger, "Flagged", shortage |

**Theme tokens**
```css
:root[data-theme="dark"] {
  --bg: #0A2A33;
  --bg-raised: #0F3A45;
  --glass: rgba(255,255,255,0.07);
  --glass-strong: rgba(255,255,255,0.12);
  --glass-border: rgba(255,255,255,0.16);
  --glass-highlight: rgba(255,255,255,0.22);   /* inner top edge */
  --text: #F2FBFA;
  --text-2: #9FC2C6;
  --text-3: #6C9097;
  --action: #FF8A3D;  --on-action: #0A2A33;
  --fun: #FF6FB1;     --info: #4C7DFF;
  --ok: #36E0B0;      --warn: #FFD23F;   --bad: #FF5A5F;
  --shadow-float: 0 24px 60px -24px rgba(0,0,0,0.55);
}
:root[data-theme="light"] {
  --bg: #EDF5F6;
  --bg-raised: #FFFFFF;
  --glass: rgba(255,255,255,0.72);
  --glass-strong: rgba(255,255,255,0.88);
  --glass-border: rgba(10,42,51,0.10);
  --glass-highlight: rgba(255,255,255,0.9);
  --text: #0C2B33;
  --text-2: #3F6269;
  --text-3: #6B8A90;
  --action: #0A2A33;  --on-action: #FF8A3D;  /* ink button with tangerine text */
  --fun: #E0458F;     --info: #2F5FE0;
  --ok: #0F9D75;      --warn: #B88400;   --bad: #D63C41;
  --shadow-float: 0 18px 40px -22px rgba(10,42,51,0.35);
}
```
Defaults: student routes start in dark; faculty/admin routes start in light; a toggle is always available and the choice is remembered.

**Contrast:** body text must meet WCAG AA against its surface. Status never relies on colour alone: every triage and status pill pairs colour with an icon and a label.

**Ambient background (student side)**
- Three blurred orbs (Tangerine, Bubblegum, Cobalt) at about 30 to 40 percent opacity, 320 to 520 px, blur 90 to 120 px, positioned **asymmetrically** (for example top-right, bottom-left, mid-left), drifting very slowly (30 to 45 s loops).
- A 3 to 4 percent film-grain overlay (inline SVG `feTurbulence` as a data URI) over the whole background so surfaces never look flat or plasticky.
- Faculty side: no orbs; a plain `--bg` with grain at 2 percent.

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Display and headings | **Bricolage Grotesque** (700 to 800) | Characterful, slightly quirky grotesque; tight tracking (-0.02em) |
| Body and UI | **Figtree** (400, 500, 600) | Friendly, clear, good at small sizes |

No third family. Use `font-variant-numeric: tabular-nums` for attendance numbers, dates and tables. Load via `next/font/google` with `display: swap` and system fallbacks.

**Scale** (mobile / desktop)
| Token | Size / line | Use |
|---|---|---|
| `display` | 44/46 / 64/66 | The ring numeral, landing hero |
| `h1` | 32/36 / 40/44 | Page titles |
| `h2` | 24/30 / 28/34 | Section titles |
| `h3` | 20/26 / 22/28 | Card titles |
| `body-lg` | 18/28 | Intro text |
| `body` | 16/24 | Default |
| `small` | 14/20 | Secondary text, table cells |
| `caption` | 12/16 | Timestamps, helper text |

Sentence case everywhere. Line length under about 70 characters for paragraphs. Labels are normal-case, medium weight, `--text-2`; no uppercase tracking.

## 5. Spacing and layout

- Base unit 4 px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Generous space is the style:** card padding 24 (20 on small phones); gap between cards 24; section gap 48; never cram two primary actions within 16 px of each other.
- Page gutters: 20 (mobile), 32 (tablet), 48 (desktop). Max content width 1200; the student request flow is a single centred column about 640 wide on large screens.
- Touch targets at least 48 x 48.
- Mobile first (design at 375 px wide). Breakpoints: 640, 1024, 1440.
- Alignment: left-aligned content and headings; centre alignment only for the ring and for empty states.
- **Navigation:** student: bottom tab bar on mobile (Home, New request, History, Profile), side rail on desktop. Faculty: left sidebar on desktop, top bar plus drawer on mobile.

## 6. Shape, depth and glass

**Glass recipe (floating layers and key student cards)**
```css
.glass {
  background: var(--glass);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-float), inset 0 1px 0 var(--glass-highlight);
}
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--bg-raised); }
}
```
**Hierarchy through shape (do not use one radius everywhere)**
| Element | Radius | Depth |
|---|---|---|
| Hero ring card | 36 | Glass strong, float shadow |
| Standard cards | 24 | Glass, subtle shadow |
| Inputs, chips | 16 | Flat with 1 px border |
| Buttons | Pill (999) | Primary has a faint inner highlight |
| Bottom sheets | 28 top corners | Glass strong |
| Table rows (faculty) | 0 with 1 px dividers | Flat |

Faculty tables and dense lists are flat. Glass is for things that float or deserve attention.

## 7. Motion

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for most; springs (stiffness about 260, damping about 24) for sheets and the stepper.
- **Durations:** 150 ms (press feedback), 250 ms (state changes), 400 ms (sheets, step transitions), 700 to 900 ms (ring fill).
- **One orchestrated entrance:** on the student Home, the ring fills from 0 to the real value while the number counts up and the subject bars follow with a 60 ms stagger. Nothing else on the page animates on load.
- **Responds to actions:** button press scales to 0.97; Dedo button's face wobbles on press; calendar dates pop with a spring when selected; step changes slide horizontally; status timeline nodes fill as states change; one small confetti burst only when attendance is **actually applied**.
- **Ambient:** orbs drift slowly (student only). No parallax. No scroll-triggered fade-ins.
- **Reduced motion:** respect `prefers-reduced-motion`: disable orbs, count-up, confetti and spring effects; keep instant state changes.
- Skeletons use a soft shimmer; skeleton shapes match final layout.

## 8. Components

**Student**
- **AttendanceRing:** SVG ring, stroke colour by band (at or above threshold + 5: Mint; within 5 above threshold: Sunny; below threshold: Cherry). Centre shows the percentage in `display`, with a short line beneath, such as "Safe", "Close", or "Below 85%". Threshold tick drawn on the ring.
- **SubjectBars:** one row per subject: name, percentage, thin bar, small "can miss N more" note (Phase 5).
- **DedoButton:** large pill in Tangerine (dark theme) with a hand-drawn crying-face sticker (custom SVG, not an OS emoji, for consistent rendering). Label: "Attendance dedo". Sub-label in `small`: "Missed class for a good reason? Start here." Sticker tilts about 6 degrees at rest and wobbles on press.
- **RequestStepper:** four steps (Dates, Sessions, Proof, Review) as a sequence, so numbers are appropriate. Progress drawn as a continuous line, not four disconnected dots. Back is always available; state is kept.
- **CalendarPicker:** restyled day picker; multi-select; days with classes show a tiny dot; weekends and holidays muted; selected days use Tangerine fill; today has a ring.
- **SessionChips:** one per session: time, subject, teacher. Tags: "Lab" (Cobalt) and "Internal test" (Sunny) with a one-line explanation of what happens; "Already present" and "Cancelled" are disabled with reason.
- **ProofDropzone:** large soft target with camera/file buttons on mobile; thumbnails with remove and replace; live pre-check messages under each file (friendly, specific).
- **StatusTimeline:** vertical, with filled nodes for completed states, pulsing node for the current one, and plain-language descriptions per state.
- **VerificationReport (student view):** shows what we found in the proof in plain words, with Mint/Sunny/Cherry icons plus labels. No scores. Shows the human reviewer's reason when decided.
- **EmptyState:** a small custom sticker illustration, one sentence, one action.

**Faculty**
- **TriagePill:** icon plus label plus colour: "Looks consistent" (check, Mint), "Needs review" (exclamation, Sunny), "Flagged" (flag, Cherry).
- **QueueRow:** student name, category, dates, session count, triage pill, age. One line; keyboard navigable.
- **EvidencePanel:** split view: document viewer (zoom, rotate) on the left; extracted fields on the right with mismatches highlighted and a "correct this field" action.
- **FindingsList:** each finding as one plain sentence with an icon; INFO findings (metadata) visually quiet and labelled "for your information".
- **SessionDecisionTable:** sessions grouped by subject; per-session decision control; reason field required; slot-type notes inline.
- **ConfirmSheet:** bottom sheet on mobile, centred dialog on desktop, used for every approve/reject/bulk action.
- **AuditTimeline:** neutral and factual; who, what, when, rule applied.

**Shared:** Toast (restyled), Skeleton, Tooltip, Dialog, Tabs, Badge, Avatar (initials on a Bubblegum/Cobalt/Mint tint), ThemeToggle.

## 9. Key screens (wireframes)

**Student Home (mobile)**
```
+------------------------------+
| Hi, Manish                   |
|                              |
|        .-----------.         |
|       /   78%       \        |   <- AttendanceRing (glass strong, r36)
|      |  Below 85%    |       |
|       \             /        |
|        '-----------'         |
|                              |
|  [ (T_T)  Attendance dedo  ] |   <- DedoButton, tilted sticker
|    Missed class for a good   |
|    reason? Start here.       |
|                              |
|  DBMS        82%  ======--   |
|  Operating   74%  =====---   |
|  AIML        91%  ========-  |
|                              |
|  Home | New | History | Me   |   <- bottom tabs
+------------------------------+
```
**Request step 3: Proof (mobile)**
```
+------------------------------+
| < Back                  3 / 4|
| Add your proof               |
| Workshop certificate works.  |
|                              |
|  +------------------------+  |
|  |  Drop a file or        |  |
|  |  [Take photo] [Browse] |  |
|  +------------------------+  |
|  certificate.pdf        [x]  |
|  Dates match 14 Oct.         |
|  Name matches your profile.  |
|                              |
|  [ Continue ]                |
+------------------------------+
```
**Teacher review (desktop)**
```
+------------+--------------------------+-------------------------+
| Queue      |  Proof viewer            |  Manish R.  Workshop    |
|  row       |  (zoom/rotate)           |  14 Oct, 5 sessions     |
|  row  <--  |                          |  [Looks consistent]     |
|  row       |                          |  Findings (plain words) |
|            |                          |  Sessions by subject    |
|            |                          |  [Approve] [Ask] [Rej.] |
+------------+--------------------------+-------------------------+
```

## 10. Imagery and illustration
- Custom SVG stickers (crying face, thumbs-up, tired-teacher, stamp, calendar) in a loose hand-drawn style with thick outlines, flat fills from the palette, and a slight offset shadow. Keep each under about 6 KB.
- No stock photos, no generic 3D blobs, no AI-style abstract gradients as illustrations.
- Document thumbnails are real uploaded proofs (private), never decorative.

## 11. Copy and microcopy

**Voice:** friendly, direct, a little cheeky on the student side; plain and professional on the faculty side. Active voice, sentence case, specific verbs. Errors explain what happened and what to do next, never apologise, never vague. Same action keeps the same name through the flow.

| Place | Copy |
|---|---|
| Home sub-line when below threshold | "You're at 78%. Let's sort the paperwork." |
| Dedo button | "Attendance dedo" / "Missed class for a good reason? Start here." |
| Step 1 | "Which days did you miss?" |
| Step 2 | "Here's what you missed on 14 Oct." |
| Lab tag | "Lab: you'll need a make-up session." |
| Internal test tag | "Internal test: your teacher decides on a re-test." |
| Step 3 | "Add your proof." |
| Pre-check date mismatch | "Your certificate shows 12 Oct, but you picked 14 Oct. Check the dates or add a note." |
| Submit button | "Send request" (toast: "Request sent.") |
| Status: with teacher | "With your class teacher." |
| Applied | "Attendance updated." (confetti once) |
| Rejected | "Not approved. Here's why: {reason}. You can add proof or appeal." |
| Empty history | "No requests yet. That's a good sign." |
| Network error | "Couldn't reach the server. Your draft is saved." |
| AI unavailable (faculty only) | "Automated check unavailable. Please review manually." |
| Quota full | "You've used your on-duty days for this semester. You can still ask your HOD for an exception." |
| Consent | "We store your proof to check your request. Only your reviewers can see it. Files are deleted {N} days after a decision." |

Never promise an outcome ("get your attendance fixed", "guaranteed"). The product promises a process: "Send a request, track it, get a decision."
Never say the AI "detects fake documents." Say "checks your proof against your details."

## 12. Accessibility and quality floor
- WCAG AA contrast; visible 2 px focus ring in Cobalt (or Tangerine on Cobalt-heavy areas); full keyboard operation; logical focus order; ARIA labels on icon buttons and on the ring (text alternative: "Attendance 78 percent, threshold 85 percent").
- Dialogs trap focus and restore it on close. Forms: labels always visible, errors tied to fields with `aria-describedby`.
- Respect reduced motion and reduced transparency (`prefers-reduced-transparency`: swap glass for solid `--bg-raised`).
- Fast: images and stickers as SVG; lazy-load viewers; no layout shift (reserve space for ring and skeletons).
- Test at 360, 375, 414, 768, 1024, 1440 widths, both themes.

## 13. Do and don't (checklist for agents)
**Do:** use tokens only; keep spacing generous; use glass for floating or key layers; give every screen loading, empty and error states; keep faculty UI calm; use real seed data in screenshots.
**Don't:** use purple-blue gradients; add uppercase eyebrows; apply one radius to everything; animate every section on scroll; put arrows on buttons; use lorem ipsum or emoji bullets; use unmodified component-kit styling; show scores or percentages as certainty for AI results; ship any screen without checking both themes and a 375 px width.
