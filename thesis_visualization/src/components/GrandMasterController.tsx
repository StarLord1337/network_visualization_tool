import { useEffect } from "react";
import { useSigma } from "@react-sigma/core";
import { useGraphHover } from "../hooks/useGraphHover";
import type { DisplayGraphProps } from "../types";
import { PHASE_COLORS, TYPE_COLORS } from "../constants"; 
import { isNodeVisible } from "../utils/filterLogic";
import type { GraphNodeAttributes } from "../types";

const MIN_NODE_SIZE = 5;
const MAX_NODE_SIZE = 20;

export const GraphMasterController = ({ filters, coloringEnabled, typesEnabled, sizeMetric }: DisplayGraphProps) => {
  const sigma = useSigma();
  const { hoveredNode, neighbors, edges } = useGraphHover();

  useEffect(() => {
    const graph = sigma.getGraph();

    let minVal = Infinity;
    let maxVal = -Infinity;

    if (sizeMetric !== "size") {
      graph.forEachNode((_node, attributes) => {
        const val = Number(attributes[sizeMetric]) || 0;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      });
    }

    if (minVal === maxVal || minVal === Infinity) {
      minVal = 0;
      maxVal = 1; 
    }

    // --- NODE REDUCER ---
    sigma.setSetting("nodeReducer", (node, data: any) => {
      const attributes = data as GraphNodeAttributes;
      const res = { ...data };

      if (!isNodeVisible(attributes, filters)) {
        res.hidden = true;
        res.label = "";
        res.zIndex = 0;
        return res;
      }

      let baseSize = 5;

      if (sizeMetric === "size") {
        baseSize = 5;
      } else {
        const rawValue = Number(attributes[sizeMetric as keyof typeof attributes]) || 0;
        let normalized = (rawValue - minVal) / (maxVal - minVal);
        normalized = Math.sqrt(normalized); 
        baseSize = MIN_NODE_SIZE + (normalized * (MAX_NODE_SIZE - MIN_NODE_SIZE));
      }
      
      res.size = baseSize;
      
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
  }, [filters, coloringEnabled, typesEnabled, hoveredNode, neighbors, edges, sigma, sizeMetric]);

  return null;
};