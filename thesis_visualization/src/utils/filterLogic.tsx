import type { FilterState } from "../types";

export const getTimestamp = (nodeAttributes: any): number => {
  const ts = nodeAttributes.creation_timestamp;
  if (typeof ts === 'number') {
    // If it looks like seconds (small number), convert to ms
    // If it looks like ms (huge number), keep it.
    // 1973 cutoff: 100000000000
    return ts < 100000000000 ? ts * 1000 : ts;
  }
  return 0;
};

export const isNodeVisible = (data: any, filters: FilterState): boolean => {
  // 1. TIMELINE CHECK
  // If the node was born AFTER the current slider position, hide it.
  if (!filters) return true;
  const nodeTime = getTimestamp(data);
  if (nodeTime > filters.currentTime) return false;

  // 2. PHASE FILTER (Existing)
  // (Assuming you still want to filter by phase if the user unchecked it in the legend)
  const phase = data.project_phase || "Unknown";
  if (!filters.selectedPhases.has(phase)) return false;

  const type = data.issue_type || "Unknown";
  if (!filters.selectedTypes.has(type)) return false;

  // 3. ESTIMATION FILTERS (The Nested Logic)
  
  // A. "Show only formal estimation"
  if (filters.showFormalEstimation) {
    // 1. Safely grab the value (handle null/undefined/missing)
    // We check both singular 'story_point' and plural 'story_points' just in case
    const rawSP = data.story_point;

    // 2. Convert to Number (handling strings like "3")
    const sp = Number(rawSP);

    // 3. THE FIX: Explicitly check for NaN
    // If it's Not a Number, OR it's 0, OR it's null/undefined... HIDE IT.
    if (isNaN(sp) || sp <= 0) {
       return false; 
    }

    // Child Filter: Changed Estimates
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