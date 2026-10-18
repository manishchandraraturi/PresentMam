import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggle } from "./theme-toggle";

const mockSetTheme = vi.fn();
let mockTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
    resolvedTheme: mockTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme = "dark";
  });

  it("renders a button with accessible role and name", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light theme/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Dark");
  });

  it("calls setTheme with 'light' when clicked from dark theme", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to light theme/i });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders light theme state and switches to dark theme when clicked", () => {
    mockTheme = "light";
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: /switch to dark theme/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Light");

    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
