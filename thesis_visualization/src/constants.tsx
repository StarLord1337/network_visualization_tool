import type { NodeDisplayData } from "sigma/types";

export const PHASE_COLORS: Record<string, string> = {
    "Phase 1": "#4169e1", // Blue
    "Phase 2": "#4daf4a", // Green
    "Phase 3": "#984ea3", // Purple
    "Backlog": "#6d8196", // Orange
}

export const TYPE_COLORS: Record<string, string> = {
    "Task": "#8b5cf6", // Violet
    "Epic": "#06b6d4", // Cyan
    "Bug": "#ec4899", // Pink
    "Story": "#f59e0b", // Amber
    "Sub-task": "#10b981" // Emerald
}
    
export type PhaseType = keyof typeof PHASE_COLORS;

export const FORCE_ATLAS_SETTINGS = {
    settings: {
      slowDown: 100, 
      gravity: 0.5,           
      scalingRatio: 30,     
      barnesHutOptimize: false,
      strongGravityMode: false,
      edgeWeightInfluence: 0,
      linLogMode: true
    }
}
  
export const SIGMA_SETTINGS = {
    renderEdgeLabels: true, 
    zIndex: true,
    defaultNodeColor: "#999",
    labelSize: 10,
    nodeReducer: (_node: string, data: any) => {
        const newData: Partial<NodeDisplayData> = { ...data, highlighted: data.highlighted || false };
        newData.size = data.size ? data.size / 2 : 3;           
        return newData;
    }
}

