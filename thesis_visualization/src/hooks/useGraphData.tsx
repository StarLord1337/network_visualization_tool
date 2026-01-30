import { useMemo } from "react";
import graphDataRaw from "../data/graph_data.json";
import { getTimestamp } from "../utils/filterLogic";
import type { GraphDataSummary, GraphNodeAttributes } from "../types";

export const useGraphData = (): GraphDataSummary => {
  return useMemo(() => {
    // 1. Cast and safely grab arrays
    const rawData = graphDataRaw as any;
    const rawNodes = rawData.nodes || rawData.data?.nodes || [];
    const rawEdges = rawData.edges || rawData.data?.edges || [];

    console.log(rawNodes.phase);

    // 2. Initialize bounds
    let min = Infinity;
    let max = -Infinity;
    const phases = new Set<string>();
    const types = new Set<string>();

    // 3. Process Nodes
    rawNodes.forEach((n: any) => {
      const attr = n.attributes as GraphNodeAttributes;
      const t = getTimestamp(attr);

      // Validation: > Year 1980 (315532800000 ms)
      if (t > 315532800000) { 
        if (t < min) min = t;
        if (t > max) max = t;
      }
      phases.add(attr.project_phase || "Unknown");
      types.add(attr.issue_type || "Unknown");
    });

    // 4. Fallbacks
    if (min === Infinity) min = new Date("2020-01-01").getTime();
    if (max === -Infinity) max = new Date().getTime();

    return { 
      nodes: rawNodes, 
      edges: rawEdges, 
      minTime: min, 
      maxTime: max, 
      allPhases: phases,
      allTypes: types, 
    };
  }, []);
};