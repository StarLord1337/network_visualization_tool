import type { FilterState } from "../types";

export const getTimestamp = (nodeAttributes: any): number => {
  const ts = nodeAttributes.creation_timestamp;
  if (typeof ts === 'number') {
    return ts < 100000000000 ? ts * 1000 : ts;
  }
  return 0;
};

export const isNodeVisible = (data: any, filters: FilterState): boolean => {
  if (!filters) return true;
  const nodeTime = getTimestamp(data);
  if (nodeTime > filters.currentTime) return false;

  const phase = data.project_phase || "Unknown";
  if (!filters.selectedPhases.has(phase)) return false;

  const type = data.issue_type || "Unknown";
  if (!filters.selectedTypes.has(type)) return false;

  if (filters.showFormalEstimation) {
    const rawSP = data.story_point;
    const sp = Number(rawSP);

    if (isNaN(sp) || sp <= 0) {
       return false; 
    }

    if (filters.showChangedEstimation) {
      const rawChanged = data.story_points_changed;
      const changed = Number(rawChanged);

      if (isNaN(changed) || changed <= 0) {
        return false;
      }
    }
  }

  return true;
};