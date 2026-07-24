import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WikiPreview } from "../../src/components/notes/WikiPreview";

describe("WikiPreview", () => {
  it("opens on pointer hover and keyboard focus, then Escape closes it", async () => {
    const user = userEvent.setup();
    render(<WikiPreview href="/notes/react-rendering" title="React 렌더링" summary="렌더링 흐름 요약" />);
    const link = screen.getByRole("link", { name: "React 렌더링" });
    await user.hover(link);
    expect(screen.getByText("렌더링 흐름 요약")).toBeTruthy();
    await user.unhover(link);
    await user.tab();
    expect(screen.getByText("렌더링 흐름 요약")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("렌더링 흐름 요약")).toBeNull();
  });
});
