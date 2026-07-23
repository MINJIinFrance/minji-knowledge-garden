import { useMemo, useState } from "react";
import type { GraphEdge, GraphNode } from "../../lib/content/graph";
import { layoutGraph } from "./graph-layout";

interface Props { nodes: GraphNode[]; edges: GraphEdge[]; }

export function KnowledgeGraph({ nodes, edges }: Props) {
  const [selected, setSelected] = useState<string | null>(nodes[0]?.id ?? null);
  const [filter, setFilter] = useState("");
  const layout = useMemo(() => layoutGraph(nodes, edges), [nodes, edges]);
  const selectedNode = nodes.find((node) => node.id === selected);
  const neighbors = selected ? new Set(edges.flatMap((edge) => edge.source === selected ? [edge.target] : edge.target === selected ? [edge.source] : [])) : new Set<string>();
  const byId = new Map(layout.nodes.map((node) => [node.id, node]));

  return <div className="knowledge-graph">
    <svg viewBox="0 0 800 600" role="img" aria-label="노트 사이의 연결 그래프">
      {layout.edges.map((edge) => { const source = byId.get(edge.source); const target = byId.get(edge.target); return source && target ? <line key={`${edge.source}-${edge.target}`} x1={source.x} y1={source.y} x2={target.x} y2={target.y} className="graph-edge" /> : null; })}
      {layout.nodes.map((node) => <g key={node.id} role="button" tabIndex={0} aria-label={`${node.title} 노드 선택`} transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`} onClick={() => setSelected(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(node.id); } }} className={selected === node.id ? "is-selected" : neighbors.has(node.id) ? "is-neighbor" : ""}><circle r="12" /><text y="-18">{node.title}</text></g>)}
    </svg>
    <div className="graph-controls">
      <label htmlFor="graph-filter">노트 찾기</label>
      <input id="graph-filter" type="search" placeholder="제목으로 찾기" value={filter} onChange={(event) => setFilter(event.target.value)} />
      <ul aria-label="그래프 노트 목록">{nodes.filter((node) => node.title.includes(filter)).map((node) => <li key={node.id}><button type="button" onClick={() => setSelected(node.id)} aria-pressed={selected === node.id} aria-label={`${node.title} 노드 선택`}>{node.title}</button></li>)}</ul>
    </div>
    {selectedNode && <section className="graph-details" aria-live="polite"><h2>{selectedNode.title}</h2><p>{selectedNode.summary}</p><a href={selectedNode.href} aria-label={`${selectedNode.title} 노트 열기`}>{selectedNode.title} 노트 열기</a>{neighbors.size > 0 && <><h3>직접 연결된 노트</h3><ul>{nodes.filter((node) => neighbors.has(node.id)).map((node) => <li key={node.id}><a href={node.href}>{node.title}</a></li>)}</ul></>}</section>}
  </div>;
}
