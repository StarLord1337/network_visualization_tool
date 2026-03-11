import { 
  SigmaContainer, 
  ControlsContainer, 
  FullScreenControl, 
  ZoomControl,
} from "@react-sigma/core";
import { LayoutForceAtlas2Control } from "@react-sigma/layout-forceatlas2";
import "@react-sigma/core/lib/style.css";
import { GraphMasterController } from "./GrandMasterController";
import { GraphDragManager } from "./GraphDragController";
import type { DisplayGraphProps } from "../types";
import type { NodeDisplayData } from "sigma/types";
import { LoadGraph } from "./LoadGraph";

const FORCE_ATLAS_SETTINGS = {
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

const SIGMA_SETTINGS = {
  renderEdgeLabels: true, 
  zIndex: true,
  defaultNodeColor: "#999",
  labelSize: 10,
  nodeReducer: (_node: string, data: any) => {
      const newData: Partial<NodeDisplayData> = { ...data, highlighted: data.highlighted || false };
      const degree = data.degree || 1;
      newData.size = 3 + (Math.sqrt(degree) * 1.5);      
      return newData;
  }
}

export const DisplayGraph = ({ filters, coloringEnabled, typesEnabled }: DisplayGraphProps) => {
  return (
    <SigmaContainer 
      style={{ height: "100%", width: "100%" }} 
      settings={SIGMA_SETTINGS}  
    >
      <LoadGraph />
      <GraphDragManager />
      <GraphMasterController filters={filters} coloringEnabled={coloringEnabled} typesEnabled={typesEnabled} />
      <div className="custom-sigma-controls">
        <ControlsContainer position={"bottom-right"}>
          <ZoomControl className="graph-btn" />
          <FullScreenControl className="graph-btn" />
          <LayoutForceAtlas2Control settings={FORCE_ATLAS_SETTINGS} />
        </ControlsContainer>
      </div>
    </SigmaContainer>
  );
};