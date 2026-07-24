import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { KnowledgeGraph } from "../../src/components/graph/KnowledgeGraph";

const nodes = [
  { id: "state-machines", title: "상태 머신", topic: "frontend", summary: "상태를 모델링합니다.", href: "/notes/state-machines" },
  { id: "react-rendering", title: "React 렌더링", topic: "frontend", summary: "렌더링 흐름입니다.", href: "/notes/react-rendering" }
];
const edges = [{ source: "react-rendering", target: "state-machines" }];

describe("KnowledgeGraph", () => {
  it("reveals the selected node and its direct neighbors", async () => {
    const user = userEvent.setup();
    render(<KnowledgeGraph nodes={nodes} edges={edges} />);
    await user.click(within(screen.getByRole("list", { name: "그래프 노트 목록" })).getByRole("button", { name: "상태 머신 노드 선택" }));
    expect(screen.getByRole("heading", { name: "상태 머신" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "React 렌더링" })).toBeTruthy();
  });
});
