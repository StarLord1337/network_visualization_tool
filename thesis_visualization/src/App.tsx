import { useState, useEffect } from "react";
import "@react-sigma/core/lib/style.css";
import './App.css';
import { DisplayGraph } from "./components/GraphLoader"; 
import { PHASE_COLORS, TYPE_COLORS } from "./constants";
import type { FilterState } from "./types";
import { useGraphData } from "./hooks/useGraphData";
import { useGraphStats } from "./hooks/useGraphStats";
import { InfoIcon } from "./utils/helperTooltip";
import "./styles/sidebar.css"
import "./styles/graph.css"

function App() {
  const total_nodes = 2321;
  const total_edges = 1594;
  const { nodes, edges, minTime, maxTime, allPhases, allTypes } = useGraphData();
  const [filters, setFilters] = useState<FilterState>({
    selectedPhases: new Set(allPhases),
    selectedTypes: new Set(allTypes),
    showFormalEstimation: false,
    showChangedEstimation: false,
    minTime: minTime,
    maxTime: maxTime,
    currentTime: maxTime,
    isPlaying: false,
    colorMode: "phase" 
  });

  const [isColoringEnabled, setIsColoringEnabled] = useState<boolean>(false);
  const [isTypesEnabled, setIsTypesEnabled] = useState<boolean>(false);

  const stats = useGraphStats(nodes, edges, filters);

  useEffect(() => {
    let interval: number;
    
    if (filters.isPlaying) {
      interval = setInterval(() => {
        setFilters(prev => {
          const range = prev.maxTime - prev.minTime;
          const step = range / 200; // 0.5 % per tick (400 for 0.25 % per tick)
          const nextTime = prev.currentTime + step;
          
          if (nextTime >= prev.maxTime) {
            return { ...prev, currentTime: prev.maxTime, isPlaying: false };
          }
          return { ...prev, currentTime: nextTime };
        });
      }, 50); // Updates 20 times per second
    }
    
    return () => clearInterval(interval);
  }, [filters.isPlaying]);

  const togglePhase = (phase: string) => {
    const newSet = new Set(filters.selectedPhases);
    if (newSet.has(phase)) newSet.delete(phase);
    else newSet.add(phase);
    setFilters({ ...filters, selectedPhases: newSet });
  };

  const toggleType = (type: string) => {
    const newSet = new Set(filters.selectedTypes);
    if (newSet.has(type)) newSet.delete(type);
    else newSet.add(type);
    setFilters({ ...filters, selectedTypes: newSet }); 
  }

  const handleSelectAll = (category: "phases" | "types") => {
    setFilters((prev) => ({
      ...prev,
      // Dynamically target the correct Set based on the argument
      [category === "phases" ? "selectedPhases" : "selectedTypes"]:
        category === "phases" ? new Set(allPhases) : new Set(allTypes),
    }));
  };

  const handleClearAll = (category: "phases" | "types") => {
    setFilters((prev) => ({
      ...prev,
      [category === "phases" ? "selectedPhases" : "selectedTypes"]: new Set(),
    }));
  };

  const formatDate = (ts: number) => ts ? new Date(ts).toLocaleDateString() : "-";

  return (
    <div className="app-layout">
      <header className="app-header">
        <h3>Project Development Network Analysis</h3>
      </header>

      <div className="content-wrapper">
      <aside className="sidebar">
          <div className="filter-section">
            <h4 style={{marginTop: '0', marginBottom: '10px'}}>Graph Controls</h4>
            
            {/* --- 1. TIMELINE PLAYER --- */}
            <div className="filter-block timeline-block" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee', borderTop: '1px solid #eee' }}>
              <h5 style={{marginTop: '10px'}}>Temporal Development</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>
                <span>{formatDate(filters.minTime)}</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>{formatDate(filters.currentTime)}</span>
                <span>{formatDate(filters.maxTime)}</span>
              </div>
              
              <input 
                type="range" 
                min={filters.minTime} 
                max={filters.maxTime} 
                value={filters.currentTime}
                onChange={(e) => setFilters({ ...filters, currentTime: Number(e.target.value) })}
                style={{ width: '100%', cursor: 'pointer' }} 
              />
              
              <button 
                onClick={() => setFilters({ ...filters, isPlaying: !filters.isPlaying })}
                style={{ 
                  width: '100%', marginTop: '10px', padding: '6px', cursor: 'pointer',
                  background: filters.isPlaying ? '#ffeba7' : '#e3f2fd',
                  border: '1px solid #ccc', borderRadius: '4px',
                  color: 'black'
                }}
              >
                {filters.isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>
            </div>

            {/* --- 2. STATS COUNTER (Unchanged) --- */}
            <div className="filter-box">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Nodes Visible:</strong> <span>{stats.nodeCount} ({stats.nodeCount > 0 ? ((stats.nodeCount / total_nodes) * 100).toFixed(1) : "0.0"}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Edges Visible:</strong> <span>{stats.edgeCount} ({stats.edgeCount > 0 ? ((stats.edgeCount / total_edges) * 100).toFixed(1) : "0.0"}%)</span>
              </div>
            </div>

            {/* --- 3. NEW: PHASE FILTERS (Always Visible) --- */}
            <div className="filter-box"> 
              {/* Header with Select All/None */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>Filter Phases:</span>
                <div style={{ fontSize: "0.8rem", gap: "8px", display: "flex" }}>
                  <span onClick={() => handleSelectAll('phases')} style={{ cursor: "pointer", color: "#377eb8" }}>All</span>
                  <span style={{ color: "#ccc" }}>|</span>
                  <span onClick={() => handleClearAll('phases')} style={{ cursor: "pointer", color: "#377eb8" }}>None</span>
                </div>
              </div>

              {/* List of Checkboxes (No Color Squares, just Filter Logic) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(PHASE_COLORS).map(([phase]) => {
                  const isActive = filters.selectedPhases.has(phase);
                  // Calculate stats
                  const count = stats.phaseCounts[phase] || 0;
                  const total = stats.nodeCount;
                  const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

                  return (
                    <label 
                      key={phase} 
                      style={{ 
                        display: 'flex', alignItems: 'center', cursor: 'pointer',
                        fontSize: '0.9rem', opacity: isActive ? 1 : 0.6
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isActive}
                        onChange={() => togglePhase(phase)}
                        style={{ marginRight: '10px' }}
                      />
                      <span style={{ marginRight: 'auto' }}>{phase}</span>
                      <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '8px' }}>
                        {count} ({percent}%)
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* --- 4. ESTIMATION FILTERS (Unchanged) --- */}
            <div className="filter-box compact">
              <div className="filter-block">
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={filters.showFormalEstimation} 
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      showFormalEstimation: e.target.checked,
                      showChangedEstimation: e.target.checked ? filters.showChangedEstimation : false 
                    })}
                    style={{ marginRight: '10px' }}
                  />
                  Has Formal Estimation

                  {!filters.showFormalEstimation && (<InfoIcon text="something really helpful" />)}
                </label>

                {filters.showFormalEstimation && (
                  <div style={{ marginLeft: '25px', paddingLeft: '10px', borderLeft: '2px solid #ddd', marginTop: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={filters.showChangedEstimation} 
                        onChange={(e) => setFilters({ ...filters, showChangedEstimation: e.target.checked })}
                        style={{ marginRight: '10px' }}
                      />
                      Changed Estimation Only

                      {!filters.showChangedEstimation && (<InfoIcon text="something really helpful" />)}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* --- 5. COLOR BY PHASE (Toggle + Static Legend) --- */}
            <div className="filter-box compact" style={{opacity: isTypesEnabled ? 0.6 : 1, transition: 'opacity 0.2s ease'}}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: isTypesEnabled ? 'default' : 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={isColoringEnabled}
                  disabled={isTypesEnabled}
                  onChange={(e) => setIsColoringEnabled(e.target.checked)}
                  style={{ marginRight: "10px" }}
                />
                Color by Phases

                {!isColoringEnabled && !isTypesEnabled && (<InfoIcon text="something really helpful" />)}
              </label>

              {/* The Legend: Only shows Colors & Names (No Inputs) */}
              {isColoringEnabled && (
                  <div style={{ marginLeft: '25px', paddingLeft: '10px', borderLeft: '2px solid #ddd', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(PHASE_COLORS).map(([phase, color]) => {
                      const count = stats.phaseCounts[phase] || 0;
                      const total = stats.nodeCount;
                      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

                      return (
                        <div 
                          key={phase} 
                          style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}
                        >
                          {/* Color Square */}
                          <div style={{ 
                            width: '12px', height: '12px', 
                            backgroundColor: color, borderRadius: '2px', 
                            marginRight: '8px', border: '1px solid rgba(0,0,0,0.1)' 
                          }} />
                          
                          <span style={{ marginRight: 'auto' }}>{phase}</span>
                          <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '8px' }}>
                            {count} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
              )}
            </div>

            {/* --- 6. COLOR BY TYPES (Unchanged) --- */}
            <div className="filter-box compact" style={{opacity: isColoringEnabled ? 0.6 : 1, transition: 'opacity 0.2s ease'}}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: isColoringEnabled ? 'default' : 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={isTypesEnabled}
                    disabled={isColoringEnabled}
                    onChange={(e) => setIsTypesEnabled(e.target.checked)}
                    style={{ marginRight: "10px" }}
                  />
                  Color by Types

                  {!isTypesEnabled && !isColoringEnabled && (<InfoIcon text="something really helpful" />)}
                </label>

                {isTypesEnabled && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>Issue Types:</span>
                    <div style={{ fontSize: "0.8rem", gap: "8px", display: "flex" }}>
                      <span onClick={() => handleSelectAll('types')} style={{ cursor: "pointer", color: "#377eb8" }}>All</span>
                      <span style={{ color: "#ccc" }}>|</span>
                      <span onClick={() => handleClearAll('types')} style={{ cursor: "pointer", color: "#377eb8" }}>None</span>
                    </div>
                  </div>

                  <div style={{ marginLeft: '25px', paddingLeft: '10px', borderLeft: '2px solid #ddd', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(TYPE_COLORS).map(([type, color]) => {
                      const isActive = filters.selectedTypes.has(type);
                      const count = stats.typeCounts[type] || 0;
                      const total = stats.nodeCount;
                      const percent = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";

                      return (
                        <label 
                          key={type} 
                          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem', opacity: isActive ? 1 : 0.6 }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isActive}
                            onChange={() => toggleType(type)}
                            style={{ marginRight: '10px' }}
                          />
                          <div style={{ width: '12px', height: '12px', backgroundColor: color, borderRadius: '2px', marginRight: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
                          <span style={{ marginRight: 'auto' }}>{type}</span>
                          <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '8px' }}>
                            {count} ({percent}%)
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}  
            </div>

          </div>
        </aside>

        <main className="graph-area">
           <DisplayGraph 
             filters={filters} 
             coloringEnabled={isColoringEnabled}
             typesEnabled={isTypesEnabled}
           />
        </main>
      </div>
    </div>
  );
}

export default App;