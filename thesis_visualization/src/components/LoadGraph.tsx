import { useEffect } from "react";
import Graph from "graphology";
import { useSigma, useLoadGraph } from "@react-sigma/core";
import graphData from "../data/graph_data.json";

export const LoadGraph = () => {
    const loadGraph = useLoadGraph();
    const sigma = useSigma();
  
    useEffect(() => {
      if (sigma.getGraph().order > 0) return;
  
      const graph = new Graph();
      graph.import(graphData as any); 
      loadGraph(graph);
  
    }, [loadGraph, sigma]);
  
    return null;
};