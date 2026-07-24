import { forceCenter, forceLink, forceManyBody, forceSimulation } from "d3-force";
import type { GraphEdge, GraphNode } from "../../lib/content/graph";

export interface PositionedNode extends GraphNode { x?: number; y?: number; }

export function layoutGraph(nodes: GraphNode[], edges: GraphEdge[]) {
  const cloned = nodes.map((node) => ({ ...node } as PositionedNode));
  const links = edges.map((edge) => ({ ...edge }));
  const simulation = forceSimulation(cloned)
    .force("charge", forceManyBody().strength(-90))
    .force("center", forceCenter(400, 300))
    .force("link", forceLink<PositionedNode, any>(links).id((node) => node.id).distance(70))
    .stop();
  for (let index = 0; index < 160; index += 1) simulation.tick();
  return { nodes: cloned, edges };
}
