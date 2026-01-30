// src/hooks/useGraphHover.ts
import { useState, useEffect, useMemo } from "react";
import { useRegisterEvents, useSigma } from "@react-sigma/core";

export const useGraphHover = () => {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      enterNode: (event) => {
        setHoveredNode(event.node);
        sigma.getContainer().style.cursor = "pointer";
      },
      leaveNode: () => {
        setHoveredNode(null);
        sigma.getContainer().style.cursor = "default";
      },
    });
  }, [registerEvents, sigma]);

  const { neighbors, edges } = useMemo(() => {
    if (!hoveredNode) {
        return { neighbors: new Set<string>(), edges: new Set<string>() };
    }
    
    const neighbors = new Set(graph.neighbors(hoveredNode));
    neighbors.add(hoveredNode); // Add self
    
    const edges = new Set(graph.edges(hoveredNode));
    
    return { neighbors, edges };
  }, [hoveredNode, graph]);

  return { hoveredNode, neighbors, edges };
};