"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { motion } from "framer-motion";
import { Network, Info } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getConceptColor } from "@/lib/utils";

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction = "TB"
) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 180, height: 60 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 30,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function KnowledgeGraph() {
  const { concepts, edges: conceptEdges, papers, setView } = useAppStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  const initialNodes: Node[] = useMemo(
    () =>
      concepts.map((concept, i) => ({
        id: concept.id,
        type: "default",
        position: { x: 0, y: 0 },
        data: {
          label: concept.name,
        },
        style: {
          background: `${getConceptColor(concept.category)}15`,
          border: `2px solid ${getConceptColor(concept.category)}60`,
          borderRadius: "12px",
          padding: "8px 16px",
          color: getConceptColor(concept.category),
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
          boxShadow: `0 0 20px ${getConceptColor(concept.category)}15`,
          width: 180,
          textAlign: "center" as const,
        },
      })),
    [concepts]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      conceptEdges
        .filter(
          (e) =>
            concepts.some((c) => c.id === e.source) &&
            concepts.some((c) => c.id === e.target)
        )
        .map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.relationship,
          animated: true,
          style: {
            stroke: "rgba(92, 124, 250, 0.4)",
            strokeWidth: 1.5,
          },
          labelStyle: {
            fill: "#94a3b8",
            fontSize: 10,
            fontFamily: "Inter, sans-serif",
          },
        })),
    [conceptEdges, concepts]
  );

  useEffect(() => {
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (concepts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Network className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-300 mb-2">
            No Knowledge Graph Yet
          </h2>
          <p className="text-dark-500 text-sm mb-6 max-w-md">
            Upload and analyze papers to see their concepts mapped in an
            interactive knowledge graph.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-5 py-2.5 rounded-xl bg-orbit-600 text-white text-sm font-medium hover:bg-orbit-500 transition-colors"
          >
            Upload Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-dark-500 text-sm mt-1">
              {concepts.length} concepts · {conceptEdges.length} connections ·{" "}
              {papers.filter((p) => p.status === "analyzed").length} papers
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              {["method", "finding", "theory", "data", "metric", "tool"].map(
                (cat) => (
                  <div key={cat} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: getConceptColor(cat) }}
                    />
                    <span className="text-dark-500 capitalize">{cat}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1" style={{ background: "#020617" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={2}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="rgba(255,255,255,0.03)"
          />
          <Controls
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        </ReactFlow>
      </div>

      {/* Info bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-3 border-t border-white/5 flex items-center gap-2 text-xs text-dark-600"
      >
        <Info className="w-3 h-3" />
        <span>Drag nodes to rearrange · Scroll to zoom · Auto-layouted with Dagre</span>
      </motion.div>
    </div>
  );
}
