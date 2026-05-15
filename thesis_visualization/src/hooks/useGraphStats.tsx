import { useMemo } from "react";
import { isNodeVisible } from "../utils/filterLogic";
import type { FilterState, GraphNodeAttributes } from "../types";

export const useGraphStats = (nodes: any[], edges: any[], filters: FilterState) => {
  return useMemo(() => {
    if (!nodes || !edges) {
      return { nodeCount: 0, edgeCount: 0, phaseCounts: {}, typeCounts: {} };
    }
    
    const phaseCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    const visibleNodes = nodes.filter((n) => {
      const attributes = n.attributes as GraphNodeAttributes;
      const isVisible = isNodeVisible(attributes, filters);
      
      if (isVisible) {
        const phase = attributes.project_phase || "Unknown";
        phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;

        const type = attributes.issue_type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
      
      return isVisible;
    });

    const visibleNodeIds = new Set(visibleNodes.map((n) => n.key));

    const visibleEdges = edges.filter((e) => 
      visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    );

    return { 
      nodeCount: visibleNodes.length, 
      edgeCount: visibleEdges.length,
      phaseCounts ,
      typeCounts
    };
  }, [filters, nodes, edges]);
};