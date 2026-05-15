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
    colorMode: "phase",
    playbackSpeed: 1 
  });

  const [isColoringEnabled, setIsColoringEnabled] = useState<boolean>(false);
  const [isTypesEnabled, setIsTypesEnabled] = useState<boolean>(false);
  const [sizeMetric, setSizeMetric] = useState<string>("degree");


  const stats = useGraphStats(nodes, edges, filters);

  useEffect(() => {
    let interval: number;
    
    if (filters.isPlaying) {
      interval = setInterval(() => {
        setFilters(prev => {
          const range = prev.maxTime - prev.minTime;
          const baseStep = range / 400;
          const step = baseStep * (prev.playbackSpeed || 1);
          const nextTime = prev.currentTime + step;
          
          if (nextTime >= prev.maxTime) {
            return { ...prev, currentTime: prev.maxTime, isPlaying: false };
          }
          return { ...prev, currentTime: nextTime };
        });
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [filters.isPlaying]);

  const phase1End = new Date('2018-03-29T08:53:00').getTime();
  const phase2End = new Date('2019-03-29T06:26:00').getTime();
  
  const getCurrentPhase = (time: number) => {
    if (time <= phase1End) return "Phase 1";
    if (time <= phase2End) return "Phase 2";
    return "Phase 3";
  };

  const jumpToPhase = (phaseNum: number) => {
    let targetTime = filters.minTime;
    if (phaseNum === 2) targetTime = phase1End + 1000;
    if (phaseNum === 3) targetTime = phase2End + 1000;

  setFilters({ ...filters, currentTime: targetTime});
  };

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

  const formatDate = (ts: number) => ts ? new Date(ts).toLocaleDateString('en-GB') : "-";

  return (
    <div className="app-layout">
      <header className="app-header">
        <h3>Project Development Network Analysis</h3>
      </header>

      <div className="content-wrapper">
      <aside className="sidebar">
          <div className="filter-section">
            <h4 style={{marginTop: '0', marginBottom: '10px'}}>Graph Controls</h4>

            {/*TIMELINE PLAYER*/}
            <div className="filter-block timeline-block" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee', borderTop: '1px solid #eee' }}>
      
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <h5 style={{ margin: 0 }}>Temporal Development</h5>
                <span style={{ 
                  background: '#333', color: 'white', padding: '2px 8px', 
                  borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' 
                }}>
                  {getCurrentPhase(filters.currentTime)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '10px', marginBottom: '5px' }}>
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
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  onClick={() => setFilters({ ...filters, isPlaying: !filters.isPlaying })}
                  style={{ 
                    flex: 1, padding: '6px', cursor: 'pointer',
                    background: filters.isPlaying ? '#ffeba7' : '#e3f2fd',
                    border: '1px solid #ccc', borderRadius: '4px',
                    color: 'black', fontWeight: 'bold'
                  }}
                >
                  {filters.isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>

                <select 
                  value={filters.playbackSpeed || 1}
                  onChange={(e) => setFilters({ ...filters, playbackSpeed: Number(e.target.value) })}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: 'white', color: 'black' }}
                >
                  <option value={0.25}>0.25x speed</option>
                  <option value={0.5}>0.5x Speed</option>
                  <option value={1}>1.0x Speed</option>
                  <option value={2}>2.0x Speed</option>
                  <option value={5}>5.0x Speed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                <button 
                  onClick={() => jumpToPhase(1)}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '4px', cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', color: 'black' }}
                >
                  ⏭ Phase 1
                </button>
                <button 
                  onClick={() => jumpToPhase(2)}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '4px', cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', color: 'black' }}
                >
                  ⏭ Phase 2
                </button>
                <button 
                  onClick={() => jumpToPhase(3)}
                  style={{ flex: 1, fontSize: '0.7rem', padding: '4px', cursor: 'pointer', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', color: 'black' }}
                >
                  ⏭ Phase 3
                </button>
              </div>

            </div>

            {/*STATS COUNTER*/}
            <div className="filter-box">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Nodes Visible:</strong> <span>{stats.nodeCount} ({stats.nodeCount > 0 ? ((stats.nodeCount / total_nodes) * 100).toFixed(1) : "0.0"}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Edges Visible:</strong> <span>{stats.edgeCount} ({stats.edgeCount > 0 ? ((stats.edgeCount / total_edges) * 100).toFixed(1) : "0.0"}%)</span>
              </div>
            </div>

            {/*PHASE FILTERS*/}
            <div className="filter-box"> 
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>Filter Phases:</span>
                <div style={{ fontSize: "0.8rem", gap: "8px", display: "flex" }}>
                  <span onClick={() => handleSelectAll('phases')} style={{ cursor: "pointer", color: "#377eb8" }}>All</span>
                  <span style={{ color: "#ccc" }}>|</span>
                  <span onClick={() => handleClearAll('phases')} style={{ cursor: "pointer", color: "#377eb8" }}>None</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(PHASE_COLORS).map(([phase]) => {
                  const isActive = filters.selectedPhases.has(phase);
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

            {/*ESTIMATION FILTERS*/}
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

                  {!filters.showFormalEstimation && (<InfoIcon text="Show only issues that were formally estimated. Filter out the rest." />)}
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

                      {!filters.showChangedEstimation && (<InfoIcon text="Show the issues, that were re-estimated afted the initial estimation. Filter out the rest." />)}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/*COLOR BY PHASE*/}
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

                {!isColoringEnabled && !isTypesEnabled && (<InfoIcon text="Enables node coloring based on its Phase. It cannot be enabled together with coloring by Types." />)}
              </label>

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

            {/*COLOR BY TYPES*/}
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

                  {!isTypesEnabled && !isColoringEnabled && (<InfoIcon text="Enables node coloring based on its type. It cannot be turned on together with coloring by Phases." />)}
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
          <div className="filter-box" style={{background: '#f8f9fa', padding: '10px', borderRadius: '6px', marginBottom: '5px', border: '1px solid #e9ecef', fontSize: '0.9rem'}}>
              <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', marginBottom: '5px', cursor: 'pointer'}}>
                Size Nodes By:
                <select 
                  value={sizeMetric} 
                  onChange={(e) => setSizeMetric(e.target.value)}
                  style={{ marginTop: '8px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', background: 'white', color: 'black' }}
                >
                  <option value="size">Uniform Size (Reset)</option>
                  <option value="degree">Degree</option>
                  <option value="betweenesscentrality">Betweenness Centrality</option>
                  <option value="closnesscentrality">Closeness Centrality</option>
                  <option value="eigencentrality">Eigenvector Centrality</option>
                  <option value="pageranks">Page Rank</option>
                </select>
              </label>
            </div>
        </aside>

        <main className="graph-area">
           <DisplayGraph 
             filters={filters} 
             coloringEnabled={isColoringEnabled}
             typesEnabled={isTypesEnabled}
             sizeMetric={sizeMetric}
           />
        </main>
      </div>
    </div>
  );
}

export default App;