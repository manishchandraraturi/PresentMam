import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000";
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    } else {
      process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    }
  });

  it("renders PresentMam title and tagline", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "ok" }),
        })
      )
    );

    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1, name: "PresentMam" });
    expect(heading).toBeInTheDocument();

    const tagline = screen.getByText(/Life happened. Let's fix the paperwork./i);
    expect(tagline).toBeInTheDocument();

    const pill = screen.getByText("Attendance regularisation");
    expect(pill).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("health-success")).toBeInTheDocument();
    });
  });

  it("renders healthy API status on successful /healthz response", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok", service: "presentmam-api" }),
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-success")).toBeInTheDocument();
      expect(screen.getByText(/API Healthy \(status: ok\)/i)).toBeInTheDocument();
      expect(screen.getByText(/"service": "presentmam-api"/i)).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/healthz", {
      headers: { Accept: "application/json" },
    });
  });

  it("renders unconfigured state when NEXT_PUBLIC_API_BASE_URL is not set", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeInTheDocument();
      expect(
        screen.getByText("NEXT_PUBLIC_API_BASE_URL is not configured.")
      ).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTitle("Not configured")).toBeInTheDocument();
  });

  it("renders error state when /healthz network request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.reject(new Error("Network connection refused"))
      )
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeInTheDocument();
      expect(screen.getByText("API Unavailable")).toBeInTheDocument();
      expect(screen.getByText("Network connection refused")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Retry Connection" })
      ).toBeInTheDocument();
    });
  });

  it("renders error state when API returns non-200 HTTP response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          statusText: "Bad Gateway",
        })
      )
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeInTheDocument();
      expect(screen.getByText("HTTP 502 (Bad Gateway)")).toBeInTheDocument();
    });
  });

  it("renders error state when /healthz returns malformed JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ unexpected: "structure" }),
        })
      )
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeInTheDocument();
      expect(
        screen.getByText("Malformed or unexpected response from /healthz")
      ).toBeInTheDocument();
    });
  });

  it("renders error state when API returns non-ok status value", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "degraded" }),
        })
      )
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("health-error")).toBeInTheDocument();
      expect(
        screen.getByText("API reported unhealthy status: degraded")
      ).toBeInTheDocument();
    });
  });

  it("allows retrying failed connection", async () => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Temporary timeout"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "ok" }),
        });
      })
    );

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Temporary timeout")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Retry Connection" });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId("health-success")).toBeInTheDocument();
      expect(screen.getByText(/API Healthy \(status: ok\)/i)).toBeInTheDocument();
    });
  });
});
