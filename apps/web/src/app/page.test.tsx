import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders PresentMam title and tagline", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1, name: "PresentMam" });
    expect(heading).toBeInTheDocument();

    const tagline = screen.getByText(/Life happened. Let's fix the paperwork./i);
    expect(tagline).toBeInTheDocument();

    const pill = screen.getByText("Attendance regularisation");
    expect(pill).toBeInTheDocument();
  });
});
