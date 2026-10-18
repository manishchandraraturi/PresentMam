import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import StyleGuidePage from "./page";

const mockNotFound = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// Mock next-themes for ThemeToggle rendering
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: vi.fn(),
    resolvedTheme: "dark",
  }),
}));

describe("StyleGuidePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls notFound() when NODE_ENV is production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => StyleGuidePage()).toThrow("NEXT_NOT_FOUND");
    expect(mockNotFound).toHaveBeenCalledTimes(1);
  });

  it("renders style guide content when in non-production environment", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<StyleGuidePage />);
    expect(mockNotFound).not.toHaveBeenCalled();

    // Verify main title and subtitle
    expect(
      screen.getByRole("heading", { level: 1, name: "PresentMam Style Guide" })
    ).toBeInTheDocument();

    // Verify core colors section
    expect(
      screen.getByRole("heading", { level: 2, name: /1\. Core Palette/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Lagoon")).toBeInTheDocument();
    expect(screen.getByText("Tangerine")).toBeInTheDocument();
    expect(screen.getByText("Bubblegum")).toBeInTheDocument();
    expect(screen.getByText("Mint")).toBeInTheDocument();

    // Verify typography ladder
    expect(
      screen.getByRole("heading", { level: 2, name: /3\. Typography Ladder/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/85% Attendance/i)).toBeInTheDocument();

    // Verify buttons and triage pills
    expect(
      screen.getByRole("button", { name: "Primary Action" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Attendance dedo/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Looks consistent")).toBeInTheDocument();
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toBeInTheDocument();
  });
});
