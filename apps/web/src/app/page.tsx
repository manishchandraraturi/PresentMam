"use client";

import { useEffect, useState } from "react";

interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const isConfigured = Boolean(apiBaseUrl.trim());
  const healthEndpoint = isConfigured
    ? `${apiBaseUrl.trim().replace(/\/+$/, "")}/healthz`
    : "";

  useEffect(() => {
    let ignore = false;

    async function checkHealth() {
      if (!isConfigured) {
        if (!ignore) {
          setError("NEXT_PUBLIC_API_BASE_URL is not configured.");
          setHealth(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(healthEndpoint, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} (${response.statusText || "Request failed"})`);
        }
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("status" in data) ||
          typeof (data as Record<string, unknown>).status !== "string"
        ) {
          throw new Error("Malformed or unexpected response from /healthz");
        }
        const healthData = data as HealthResponse;
        if (healthData.status !== "ok") {
          throw new Error(`API reported unhealthy status: ${healthData.status}`);
        }
        if (!ignore) {
          setHealth(healthData);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to connect to API");
          setHealth(null);
          setLoading(false);
        }
      }
    }

    checkHealth();

    return () => {
      ignore = true;
    };
  }, [healthEndpoint, isConfigured]);

  const handleRetry = () => {
    if (!isConfigured) {
      setError("NEXT_PUBLIC_API_BASE_URL is not configured.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(healthEndpoint, {
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} (${response.statusText || "Request failed"})`);
        }
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("status" in data) ||
          typeof (data as Record<string, unknown>).status !== "string"
        ) {
          throw new Error("Malformed or unexpected response from /healthz");
        }
        const healthData = data as HealthResponse;
        if (healthData.status !== "ok") {
          throw new Error(`API reported unhealthy status: ${healthData.status}`);
        }
        setHealth(healthData);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to connect to API");
        setHealth(null);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

        {/* API Health Check Section */}
        <section
          aria-label="API Health Status"
          className="mt-8 rounded-2xl border border-glass-border bg-glass p-4 text-left backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-sans text-xs font-semibold uppercase tracking-wider text-text-3">
              Backend Service
            </span>
            <span
              className="font-mono text-xs text-text-3 truncate max-w-[200px]"
              title={healthEndpoint || "Not configured"}
            >
              {healthEndpoint || "Not configured"}
            </span>
          </div>

          <div className="mt-3">
            {loading && (
              <div
                data-testid="health-loading"
                className="flex items-center gap-2 text-sm text-text-2"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-info" />
                </span>
                <span>Connecting to backend /healthz...</span>
              </div>
            )}

            {!loading && error && (
              <div data-testid="health-error" className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-bad">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-bad" />
                  <span>API Unavailable</span>
                </div>
                <p className="text-xs text-text-2">{error}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 cursor-pointer rounded-lg bg-glass-strong px-3 py-1.5 text-xs font-medium text-text transition hover:bg-glass-border"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {!loading && health && (
              <div data-testid="health-success" className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-medium text-ok">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-ok" />
                  <span>API Healthy (status: {health.status})</span>
                </div>
                <pre className="rounded bg-black/20 p-2 font-mono text-xs text-text-2 overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
