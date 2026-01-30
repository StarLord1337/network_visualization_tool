import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { useGraphHover } from "../hooks/useGraphHover";
import type { DisplayGraphProps } from "../types";
import { PHASE_COLORS, TYPE_COLORS } from "../constants"; 
import { isNodeVisible } from "../utils/filterLogic";
import type { GraphNodeAttributes } from "../types";

export const GraphMasterController = ({ filters, coloringEnabled, typesEnabled }: DisplayGraphProps) => {
  const sigma = useSigma();
  const { hoveredNode, neighbors, edges } = useGraphHover();

  useEffect(() => {
    // --- NODE REDUCER ---
    sigma.setSetting("nodeReducer", (node, data: any) => {
      const attributes = data as GraphNodeAttributes;
      const res = { ...data };

      if (!isNodeVisible(attributes, filters)) {
        res.hidden = true;
        res.label = "";
        res.zIndex = 0;
        return res; // Stop here if hidden
      }
      
      if (coloringEnabled) {
        const nodePhase = attributes.project_phase || "Unknown";
        res.color = PHASE_COLORS[nodePhase] || data.color || "#999";
      } else if (typesEnabled) {
        const nodeType = attributes.issue_type || "Unknown";
        res.color = TYPE_COLORS[nodeType] || data.color || "#999";
      } else {
        res.color = "#999";
      }

      if (hoveredNode) {
        if (node === hoveredNode || neighbors.has(node)) {
          res.highlighted = true;
          res.zIndex = 10;
        } else {
          res.color = "#e5e5e5"; 
          res.label = "";
          res.zIndex = 0;
          res.size = (data.size || 3) / 2;
        }
      }
      return res;
    });

    // --- EDGE REDUCER ---
    sigma.setSetting("edgeReducer", (edge, data: any) => {
      const res = { ...data };
      const g = sigma.getGraph();
      
      if (g.getNodeAttribute(g.source(edge), "hidden") || g.getNodeAttribute(g.target(edge), "hidden")) {
        res.hidden = true;
        return res;
      }

      // Your existing Hover Logic
      if (hoveredNode) {
        if (edges.has(edge)) {
          res.color = "#FA4F40";
          res.zIndex = 10;
          res.hidden = false;
        } else {
          res.hidden = true;
        }
      }
      return res;
    });

    sigma.refresh();
  }, [filters, coloringEnabled, typesEnabled, hoveredNode, neighbors, edges, sigma]);

  return null;
};