export interface GraphNodeAttributes {
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  creation_date: string;
  creation_timestamp: number;  
  resolution_time: number;
  issue_type: string;    
  priority: string;  
  project_phase: string;    
  story_point: number;
  story_points_changed: number;
  degree: number;
}
  
export interface FilterState {
  selectedPhases: Set<string>;
  selectedTypes: Set<string>;
  showFormalEstimation: boolean; 
  showChangedEstimation: boolean; 
  minTime: number;    
  maxTime: number;    
  currentTime: number; 
  isPlaying: boolean;
  colorMode: "phase" | "sprint"; 
}

export interface DisplayGraphProps {
  filters: FilterState
  coloringEnabled: boolean;
  typesEnabled: boolean;
}

export interface GraphDataSummary {
  nodes: any[];
  edges: any[];
  minTime: number;
  maxTime: number;
  allPhases: Set<string>;
  allTypes: Set<string>;
}