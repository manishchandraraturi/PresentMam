export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="glass max-w-lg rounded-3xl p-8 shadow-float">
        <h1 className="font-display text-4xl font-bold tracking-tight text-text">
          PresentMam
        </h1>
        <p className="mt-3 font-sans text-lg text-text-2">
          Life happened. Let&apos;s fix the paperwork.
        </p>
        <div className="mt-6 inline-flex items-center rounded-full bg-action px-6 py-2.5 text-sm font-semibold text-on-action shadow-sm transition hover:opacity-90">
          Attendance regularisation
        </div>
      </div>
    </main>
  );
}
