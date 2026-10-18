import { ThemeToggle } from "@/components/theme-toggle";

export default function StyleGuideContent() {
  const coreColors = [
    { name: "Lagoon", hex: "#0A2A33", role: "Dark base", cssVar: "var(--color-lagoon)" },
    { name: "Lagoon Raised", hex: "#0F3A45", role: "Dark raised surface", cssVar: "var(--color-lagoon-raised)" },
    { name: "Sea Glass", hex: "#EDF5F6", role: "Light base", cssVar: "var(--color-sea-glass)" },
    { name: "Tangerine", hex: "#FF8A3D", role: "Primary action", cssVar: "var(--color-tangerine)" },
    { name: "Bubblegum", hex: "#FF6FB1", role: "Fun accent: stickers, celebratory", cssVar: "var(--color-bubblegum)" },
    { name: "Cobalt", hex: "#4C7DFF", role: "Information, links, focus", cssVar: "var(--color-cobalt)" },
    { name: "Mint", hex: "#36E0B0", role: "Success, 'Looks consistent'", cssVar: "var(--color-mint)" },
    { name: "Sunny", hex: "#FFD23F", role: "Caution, 'Needs review'", cssVar: "var(--color-sunny)" },
    { name: "Cherry", hex: "#FF5A5F", role: "Danger, 'Flagged', shortage", cssVar: "var(--color-cherry)" },
  ];

  const semanticTokens = [
    { token: "--bg", role: "Page background", bgClass: "bg-bg", textClass: "text-text" },
    { token: "--bg-raised", role: "Raised surface / cards", bgClass: "bg-bg-raised", textClass: "text-text" },
    { token: "--text", role: "Primary heading & body text", bgClass: "bg-text", textClass: "text-bg" },
    { token: "--text-2", role: "Secondary text & labels", bgClass: "bg-text-2", textClass: "text-bg" },
    { token: "--text-3", role: "Muted hints & timestamps", bgClass: "bg-text-3", textClass: "text-bg" },
    { token: "--action", role: "Primary action background", bgClass: "bg-action", textClass: "text-on-action" },
    { token: "--fun", role: "Stickers, highlights", bgClass: "bg-fun", textClass: "text-bg" },
    { token: "--info", role: "Informational states", bgClass: "bg-info", textClass: "text-bg" },
    { token: "--ok", role: "Consistent / healthy", bgClass: "bg-ok", textClass: "text-bg" },
    { token: "--warn", role: "Needs review / warning", bgClass: "bg-warn", textClass: "text-bg" },
    { token: "--bad", role: "Flagged / shortage", bgClass: "bg-bad", textClass: "text-bg" },
  ];

  const typographyLadder = [
    {
      name: "Display",
      token: "display (44/64 px)",
      element: (
        <p className="font-display text-4xl font-bold tracking-tight text-text md:text-6xl">
          85% Attendance
        </p>
      ),
      description: "Bricolage Grotesque (700/800) • Tracking -0.02em • Ring numeral, landing hero",
    },
    {
      name: "Heading 1",
      token: "h1 (32/40 px)",
      element: (
        <h1 className="font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
          Attendance Regularisation
        </h1>
      ),
      description: "Bricolage Grotesque (700) • Page titles",
    },
    {
      name: "Heading 2",
      token: "h2 (24/28 px)",
      element: (
        <h2 className="font-display text-2xl font-bold tracking-tight text-text md:text-3xl">
          Review Requests Queue
        </h2>
      ),
      description: "Bricolage Grotesque (700) • Section titles",
    },
    {
      name: "Heading 3",
      token: "h3 (20/22 px)",
      element: (
        <h3 className="font-display text-xl font-bold text-text md:text-2xl">
          Medical Leave Certificate
        </h3>
      ),
      description: "Bricolage Grotesque (700) • Card titles",
    },
    {
      name: "Body Large",
      token: "body-lg (18 px / 28)",
      element: (
        <p className="font-sans text-lg text-text-2">
          Life happened. Let&apos;s fix the paperwork without five-times repetition.
        </p>
      ),
      description: "Figtree (500) • Intro & lead paragraphs",
    },
    {
      name: "Body",
      token: "body (16 px / 24)",
      element: (
        <p className="font-sans text-base text-text">
          Student submits one request for one or more missed dates with proof. AI assists; faculty decides.
        </p>
      ),
      description: "Figtree (400) • Default content text",
    },
    {
      name: "Small",
      token: "small (14 px / 20)",
      element: (
        <p className="font-sans text-sm text-text-2">
          Approved sessions become audited, reversible attendance corrections.
        </p>
      ),
      description: "Figtree (500) • Secondary text, table cells, form helpers",
    },
    {
      name: "Caption",
      token: "caption (12 px / 16)",
      element: (
        <p className="font-sans text-xs text-text-3">
          Submitted on 18 Oct 2026, 09:30 IST • Request ID: pm-req-2026-0042
        </p>
      ),
      description: "Figtree (400) • Timestamps, metadata, microcopy",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-glass-border bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <span className="inline-block rounded-full bg-glass px-2.5 py-0.5 font-mono text-[11px] font-semibold text-text-2">
              DEV ONLY • P0-T9
            </span>
            <h1 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
              PresentMam Style Guide
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-sans text-xs text-text-3 sm:inline">Theme Switcher:</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-5 py-10 md:px-8">
        {/* Intro */}
        <section className="glass rounded-3xl p-6 shadow-float md:p-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-text md:text-3xl">
            Design Tokens & Principles
          </h2>
          <p className="mt-2 font-sans text-base text-text-2">
            A funky, glassy, colourful student experience and a calm, clear faculty workspace.
            All components strictly reuse design tokens from <code className="font-mono text-xs">DESIGN.md</code>.
            Toggle between dark and light themes above to inspect token adaptation.
          </p>
        </section>

        {/* 1. Core Palette */}
        <section aria-labelledby="core-palette-title" className="space-y-6">
          <div>
            <h2 id="core-palette-title" className="font-display text-2xl font-bold tracking-tight text-text">
              1. Core Palette (Named)
            </h2>
            <p className="mt-1 font-sans text-sm text-text-2">
              Fixed reference colors defined in DESIGN.md section 3.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreColors.map((color) => (
              <div
                key={color.name}
                className="flex items-center gap-4 rounded-2xl border border-glass-border bg-bg-raised p-4 shadow-sm"
              >
                <div
                  className="h-14 w-14 shrink-0 rounded-xl border border-white/10 shadow-inner"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate font-sans text-sm font-semibold text-text">{color.name}</h3>
                    <code className="font-mono text-xs text-text-3">{color.hex}</code>
                  </div>
                  <p className="mt-1 font-sans text-xs text-text-2">{color.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Semantic Theme Tokens */}
        <section aria-labelledby="semantic-tokens-title" className="space-y-6">
          <div>
            <h2 id="semantic-tokens-title" className="font-display text-2xl font-bold tracking-tight text-text">
              2. Semantic Theme Tokens
            </h2>
            <p className="mt-1 font-sans text-sm text-text-2">
              Values automatically adapt based on active <code className="font-mono text-xs">data-theme</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {semanticTokens.map((item) => (
              <div
                key={item.token}
                className="flex flex-col justify-between rounded-xl border border-glass-border bg-glass p-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono text-xs font-semibold text-text">{item.token}</code>
                  <div className={`h-5 w-5 rounded-md border border-white/10 ${item.bgClass}`} aria-hidden="true" />
                </div>
                <p className="mt-2 font-sans text-xs text-text-3">{item.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Typography Ladder */}
        <section aria-labelledby="typography-title" className="space-y-6">
          <div>
            <h2 id="typography-title" className="font-display text-2xl font-bold tracking-tight text-text">
              3. Typography Ladder
            </h2>
            <p className="mt-1 font-sans text-sm text-text-2">
              Display & Headings: <strong>Bricolage Grotesque</strong>. Body & UI: <strong>Figtree</strong>.
            </p>
          </div>

          <div className="space-y-4 rounded-3xl border border-glass-border bg-glass p-6 md:p-8">
            {typographyLadder.map((type) => (
              <div key={type.name} className="border-b border-glass-border/60 pb-5 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-text-3">
                    {type.name} • {type.token}
                  </span>
                  <span className="font-sans text-xs text-text-3">{type.description}</span>
                </div>
                <div className="mt-2">{type.element}</div>
              </div>
            ))}

            {/* Tabular numbers demo */}
            <div className="rounded-2xl border border-glass-border bg-bg-raised p-4">
              <span className="font-mono text-xs uppercase tracking-wider text-text-3">
                Tabular Numbers Check (font-variant-numeric: tabular-nums)
              </span>
              <div className="mt-2 grid grid-cols-1 gap-2 font-mono text-sm text-text sm:grid-cols-3">
                <div>78.4% (Below 85%)</div>
                <div>14 / 18 Sessions</div>
                <div>2026-10-18 09:00</div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Shape, Depth & Glass */}
        <section aria-labelledby="glass-title" className="space-y-6">
          <div>
            <h2 id="glass-title" className="font-display text-2xl font-bold tracking-tight text-text">
              4. Shape, Depth & Glass Hierarchy
            </h2>
            <p className="mt-1 font-sans text-sm text-text-2">
              Specific radiuses and depths defined in DESIGN.md section 6.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Hero Card */}
            <div className="glass rounded-[36px] p-6 shadow-float md:p-8">
              <span className="rounded-full bg-glass px-2.5 py-1 font-mono text-xs text-text-3">
                Hero Card • radius 36px • glass strong + float shadow
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-text">Attendance Ring Card</h3>
              <p className="mt-2 font-sans text-sm text-text-2">
                Reserved for key moments like the animated Attendance Ring on the student home screen.
              </p>
            </div>

            {/* Standard Card */}
            <div className="glass rounded-3xl p-6 md:p-8">
              <span className="rounded-full bg-glass px-2.5 py-1 font-mono text-xs text-text-3">
                Standard Card • radius 24px • glass
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-text">Request Details Card</h3>
              <p className="mt-2 font-sans text-sm text-text-2">
                Standard container for session chips, proof upload zones, and timeline steps.
              </p>
            </div>

            {/* Input / Chip */}
            <div className="rounded-2xl border border-glass-border bg-bg-raised p-6 shadow-sm">
              <span className="rounded-full bg-glass px-2.5 py-1 font-mono text-xs text-text-3">
                Input / Chip • radius 16px • flat with 1px border
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-text">Form Field & Filter Chip</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-2xl border border-glass-border bg-glass px-3 py-1 font-sans text-xs text-text">
                  CS301 Theory
                </span>
                <span className="rounded-2xl border border-glass-border bg-glass px-3 py-1 font-sans text-xs text-text">
                  Lab Session
                </span>
              </div>
            </div>

            {/* Bottom Sheet Specimen */}
            <div className="rounded-t-[28px] border-t border-x border-glass-border bg-glass-strong p-6 shadow-float">
              <span className="rounded-full bg-glass px-2.5 py-1 font-mono text-xs text-text-3">
                Bottom Sheet • radius 28px top corners • glass strong
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-text">Confirm Action Sheet</h3>
              <p className="mt-2 font-sans text-sm text-text-2">
                Used for modal decisions, batch approvals, and student action confirmations.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Button Variants & Triage Pills */}
        <section aria-labelledby="buttons-title" className="space-y-6">
          <div>
            <h2 id="buttons-title" className="font-display text-2xl font-bold tracking-tight text-text">
              5. Button Variants & Status Pills
            </h2>
            <p className="mt-1 font-sans text-sm text-text-2">
              Action hierarchy and triage status indicators pairing color with icon and label.
            </p>
          </div>

          <div className="space-y-6 rounded-3xl border border-glass-border bg-glass p-6 md:p-8">
            {/* Buttons Row */}
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-3">
                Button Styles
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {/* Primary Action Button */}
                <button
                  type="button"
                  className="cursor-pointer rounded-full bg-action px-6 py-2.5 font-sans text-sm font-semibold text-on-action shadow-sm transition hover:opacity-90"
                >
                  Primary Action
                </button>

                {/* Dedo Button (Sticker style) */}
                <button
                  type="button"
                  className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-action px-6 py-3 font-sans text-sm font-bold text-on-action shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Custom crying face SVG sticker */}
                  <svg
                    className="h-5 w-5 shrink-0 rotate-[-6deg]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                    <path d="M7 11v3" />
                    <path d="M17 11v3" />
                  </svg>
                  <span>Attendance dedo</span>
                </button>

                {/* Glass Button */}
                <button
                  type="button"
                  className="cursor-pointer rounded-full border border-glass-border bg-glass px-5 py-2.5 font-sans text-sm font-medium text-text backdrop-blur-sm transition hover:bg-glass-strong"
                >
                  Secondary Glass
                </button>

                {/* Ghost / Action Link */}
                <button
                  type="button"
                  className="cursor-pointer rounded-full bg-glass-strong px-4 py-2 font-sans text-xs font-medium text-text-2 transition hover:text-text"
                >
                  Subtle Action
                </button>
              </div>
            </div>

            {/* Triage Pills */}
            <div className="border-t border-glass-border/60 pt-6">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-text-3">
                Triage & Finding Pills (Color + Icon + Label)
              </h3>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* Looks consistent (Mint) */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ok/30 bg-ok/10 px-3.5 py-1.5 font-sans text-xs font-semibold text-ok">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Looks consistent</span>
                </span>

                {/* Needs review (Sunny) */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/10 px-3.5 py-1.5 font-sans text-xs font-semibold text-warn">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Needs review</span>
                </span>

                {/* Flagged (Cherry) */}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-bad/30 bg-bad/10 px-3.5 py-1.5 font-sans text-xs font-semibold text-bad">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                  <span>Flagged</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
