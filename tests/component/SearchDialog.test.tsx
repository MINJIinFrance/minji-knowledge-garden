import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchDialog } from "../../src/components/search/SearchDialog";

describe("SearchDialog", () => {
  it("opens, searches Korean text, and restores focus", async () => {
    const user = userEvent.setup();
    const search = vi.fn().mockResolvedValue([
      { url: "/notes/state-machines", meta: { title: "상태 머신" }, excerpt: "상태를 명시적으로..." }
    ]);
    render(<SearchDialog search={search} />);
    const opener = screen.getByRole("button", { name: "검색 열기" });
    opener.focus();
    await user.keyboard("{Control>}k{/Control}");
    await user.type(screen.getByRole("searchbox"), "상태");
    expect(await screen.findByRole("link", { name: /상태 머신/ })).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
