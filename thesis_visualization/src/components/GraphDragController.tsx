import { useGraphDrag } from "../hooks/useGraphDrag";

export const GraphDragManager = () => {
  // Just calling the hook activates the logic
  useGraphDrag();
  
  // This component doesn't render any visible HTML
  return null;
};