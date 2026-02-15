// src/App.tsx

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Info } from 'lucide-react';
import type { 
  UMLNode, 
  UMLEdge, 
  DragInfo, 
  PanInfo, 
  ConnectionState, 
  TempConnection, 
  EntityForm, 
  MemberForm,
  AnchorPoint 
} from './interfaces/uml';
import { NODE_W, NODE_H, GRID_SIZE, MIN_ZOOM, MAX_ZOOM, RELATIONSHIP_TYPES } from './constants/config';
import { snapToGrid } from './utils/geometry';
import { getManhattanPath } from './utils/routing';
import { storageService } from './services/storage';
import { UMLClassNode } from './components/canvas/UMLClassNode';
import { ConnectionLine } from './components/canvas/ConnectionLine';
import { PropertyInspector } from './components/inspector/PropertyInspector';
import { EntityModal } from './components/modals/EntityModal';
import { MemberModal } from './components/modals/MemberModal';
import { Sidebar } from './components/ui/Sidebar';
import { TopBar } from './components/ui/TopBar';

const DEFAULT_NODES: UMLNode[] = [
  { 
    id: '1', 
    x: 100, 
    y: 150, 
    data: { 
      name: 'Customer', 
      type: 'class', 
      stereotype: '', 
      attributes: [
        { visibility: '+', name: 'customerId', type: 'string' },
        { visibility: '-', name: 'email', type: 'string' }
      ], 
      operations: [
        { visibility: '+', name: 'register', returnType: 'void' }
      ] 
    } 
  },
  { 
    id: '2', 
    x: 500, 
    y: 150, 
    data: { 
      name: 'Order', 
      type: 'class', 
      stereotype: '', 
      attributes: [
        { visibility: '+', name: 'orderId', type: 'string' },
        { visibility: '+', name: 'total', type: 'number' }
      ], 
      operations: [
        { visibility: '+', name: 'calculate', returnType: 'number' },
        { visibility: '+', name: 'submit', returnType: 'boolean' }
      ] 
    } 
  }
];

const DEFAULT_EDGES: UMLEdge[] = [
  { 
    id: 'e1', 
    from: '1', 
    to: '2', 
    type: 'association', 
    startMult: '1', 
    endMult: '*',
    startAnchor: null,
    endAnchor: null
  }
];

const App: React.FC = () => {
  // State Management
  const [nodes, setNodes] = useState<UMLNode[]>(() => {
    const saved = storageService.loadNodes();
    return saved.length > 0 ? saved : DEFAULT_NODES;
  });

  const [edges, setEdges] = useState<UMLEdge[]>(() => {
    const saved = storageService.loadEdges();
    return saved.length > 0 ? saved : DEFAULT_EDGES;
  });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);
  const [panInfo, setPanInfo] = useState<PanInfo | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const [tempConnection, setTempConnection] = useState<TempConnection | null>(null);
  const [activeModal, setActiveModal] = useState<'entity' | 'member' | null>(null);
  const [entityForm, setEntityForm] = useState<EntityForm>({ name: 'NewEntity', type: 'class' });
  const [memberForm, setMemberForm] = useState<MemberForm>({ 
    name: '', 
    type: '', 
    visibility: '+', 
    typeGroup: 'attr', 
    index: -1 
  });
  const [showGrid, setShowGrid] = useState(true);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Persist to localStorage
  useEffect(() => {
    storageService.saveNodes(nodes);
    storageService.saveEdges(edges);
  }, [nodes, edges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected item
      if ((e.key === 'Delete' || e.key === 'Backspace') && !activeModal) {
        e.preventDefault();
        deleteSelection();
      }
      
      // Cancel connection mode
      if (e.key === 'Escape') {
        setConnectionState(null);
        setTempConnection(null);
        setSelectedId(null);
        setSelectedEdgeId(null);
      }
      
      // Quick relationship type switch during connection
      if (connectionState && e.key >= '1' && e.key <= '6') {
        const types = Object.keys(RELATIONSHIP_TYPES);
        const index = parseInt(e.key) - 1;
        if (types[index]) {
          setConnectionState(prev => prev ? { ...prev, type: types[index] as UMLEdge['type'] } : null);
        }
      }

      // Copy node
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedId && !activeModal) {
        e.preventDefault();
        const node = nodes.find(n => n.id === selectedId);
        if (node) {
          const newNode: UMLNode = {
            ...node,
            id: `n-${Date.now()}`,
            x: node.x + 50,
            y: node.y + 50,
            data: { ...node.data, name: `${node.data.name}Copy` }
          };
          setNodes(prev => [...prev, newNode]);
          setSelectedId(newNode.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, selectedEdgeId, connectionState, activeModal, nodes]);

  // Zoom and Pan handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(zoom + delta, MIN_ZOOM), MAX_ZOOM);
      
      // Zoom towards mouse position
      const zoomFactor = newZoom / zoom;
      setPan(p => ({
        x: mouseX - (mouseX - p.x) * zoomFactor,
        y: mouseY - (mouseY - p.y) * zoomFactor
      }));
      
      setZoom(newZoom);
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, [zoom]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Canvas panning
    if (panInfo) {
      setPan({ x: e.clientX - panInfo.startX, y: e.clientY - panInfo.startY });
      return;
    }
    
    // Node dragging
    if (dragInfo) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const rawX = (e.clientX - rect.left - pan.x) / zoom - dragInfo.offsetX;
      const rawY = (e.clientY - rect.top - pan.y) / zoom - dragInfo.offsetY;
      const x = snapToGrid(rawX, GRID_SIZE);
      const y = snapToGrid(rawY, GRID_SIZE);
      setNodes(prev => prev.map(n => n.id === dragInfo.id ? { ...n, x, y } : n));
    }
    
    // Temporary connection line
    if (tempConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setTempConnection(prev => prev ? { ...prev, endX: x, endY: y } : null);
    }
  }, [panInfo, dragInfo, tempConnection, pan, zoom]);

  const handleMouseUp = useCallback(() => {
    setDragInfo(null);
    setPanInfo(null);
    setTempConnection(null);
  }, []);

  const startDragging = (e: React.MouseEvent, id: string) => {
    if (connectionState) return; // Don't drag in connection mode
    
    const node = nodes.find(n => n.id === id);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!node || !rect) return;
    
    setDragInfo({
      id,
      offsetX: (e.clientX - rect.left - pan.x) / zoom - node.x,
      offsetY: (e.clientY - rect.top - pan.y) / zoom - node.y
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).closest('svg')) {
      setSelectedId(null);
      setSelectedEdgeId(null);
      if (!e.shiftKey) {
        setConnectionState(null);
        setTempConnection(null);
      }
    }
  };

  const handleAnchorClick = (nodeId: string, anchor: string, point: AnchorPoint) => {
    if (!connectionState) {
      // Start new connection
      setConnectionState({ 
        fromId: nodeId, 
        fromAnchor: anchor,
        type: 'association' 
      });
      setTempConnection({
        startX: point.x,
        startY: point.y,
        endX: point.x,
        endY: point.y
      });
    } else if (connectionState.fromId === nodeId) {
      // Clicked on same node - cancel or change anchor
      if (connectionState.fromAnchor === anchor) {
        setConnectionState(null);
        setTempConnection(null);
      } else {
        setConnectionState(prev => prev ? { ...prev, fromAnchor: anchor } : null);
        setTempConnection(prev => prev ? { ...prev, startX: point.x, startY: point.y } : null);
      }
    } else {
      // Complete connection to different node
      const newEdge: UMLEdge = {
        id: `e-${Date.now()}`,
        from: connectionState.fromId,
        to: nodeId,
        type: connectionState.type,
        startMult: '',
        endMult: '',
        startAnchor: connectionState.fromAnchor,
        endAnchor: anchor
      };
      setEdges(prev => [...prev, newEdge]);
      setConnectionState(null);
      setTempConnection(null);
      setSelectedEdgeId(newEdge.id);
    }
  };

  const deleteSelection = () => {
    if (selectedId) {
      setNodes(prev => prev.filter(n => n.id !== selectedId));
      setEdges(prev => prev.filter(e => e.from !== selectedId && e.to !== selectedId));
      setSelectedId(null);
    } else if (selectedEdgeId) {
      setEdges(prev => prev.filter(e => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  const createEntity = () => {
    if (!entityForm.name.trim()) return;
    
    const newNode: UMLNode = { 
      id: `n-${Date.now()}`, 
      x: Math.max(0, (window.innerWidth / 2 - pan.x) / zoom - NODE_W / 2), 
      y: Math.max(0, (window.innerHeight / 2 - pan.y) / zoom - NODE_H / 2), 
      data: { 
        name: entityForm.name,
        type: entityForm.type,
        stereotype: '', 
        attributes: [], 
        operations: [] 
      } 
    };
    setNodes(prev => [...prev, newNode]); 
    setActiveModal(null); 
    setSelectedId(newNode.id);
  };

  const saveMember = () => {
    if (!memberForm.name.trim() || !selectedId) return;
    
    setNodes(prev => prev.map(n => {
      if (n.id !== selectedId) return n;
      
      const key = memberForm.typeGroup === 'attr' ? 'attributes' : 'operations';
      const newItem = memberForm.typeGroup === 'attr' 
        ? { visibility: memberForm.visibility, name: memberForm.name, type: memberForm.type || 'string' }
        : { visibility: memberForm.visibility, name: memberForm.name, returnType: memberForm.type || 'void' };
      
      let list = [...n.data[key]];
      if (memberForm.index >= 0) {
        list[memberForm.index] = newItem as any;
      } else {
        list.push(newItem as any);
      }
      
      return { ...n, data: { ...n.data, [key]: list }};
    }));
    setActiveModal(null);
  };

  const renderedEdges = useMemo(() => {
    return edges.map(edge => {
      const n1 = nodes.find(n => n.id === edge.from);
      const n2 = nodes.find(n => n.id === edge.to);
      const routing = getManhattanPath(n1 || null, n2 || null, edge.startAnchor, edge.endAnchor);
      return { ...edge, ...routing };
    });
  }, [edges, nodes]);

  const selectedNode = nodes.find(n => n.id === selectedId) || null;
  const selectedEdge = edges.find(e => e.id === selectedEdgeId) || null;

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* SIDEBAR */}
      <Sidebar
        selectedId={selectedId}
        selectedEdgeId={selectedEdgeId}
        connectionState={connectionState}
        showGrid={showGrid}
        onCreateEntity={() => { 
          setEntityForm({ name: 'NewClass', type: 'class' }); 
          setActiveModal('entity'); 
        }}
        onStartConnection={() => {
          if (selectedId) {
            setConnectionState({ fromId: selectedId, type: 'association', fromAnchor: null });
          }
        }}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onDelete={deleteSelection}
      />

      {/* MAIN CANVAS AREA */}
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* HEADER */}
        <TopBar
          connectionState={connectionState}
          onChangeConnectionType={(type) => setConnectionState(prev => prev ? { ...prev, type } : null)}
          onClearCanvas={() => {
            storageService.clearAll();
            window.location.reload();
          }}
        />

        {/* CANVAS */}
        <div 
          ref={canvasRef}
          className="flex-1 relative bg-slate-950 cursor-default"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseDown={(e) => { 
            if (e.button === 1 || e.button === 2) {
              e.preventDefault();
              setPanInfo({ startX: e.clientX - pan.x, startY: e.clientY - pan.y });
            } else if (e.button === 0) {
              handleCanvasClick(e);
            }
          }}
          onWheel={handleWheel}
          onContextMenu={(e) => e.preventDefault()}
          style={{ 
            backgroundImage: showGrid ? `radial-gradient(circle, #334155 ${1 * zoom}px, transparent 1px)` : 'none',
            backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          <div 
            className="absolute top-0 left-0 origin-top-left will-change-transform"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* SVG Layer for Connections */}
            <svg className="overflow-visible absolute top-0 left-0 pointer-events-none" style={{ width: 1, height: 1 }}>
              <defs>
                {/* Arrow Markers */}
                <marker id="uml-inheritance" markerWidth="16" markerHeight="16" refX="15" refY="8" orient="auto">
                  <path d="M0,0 L16,8 L0,16 Z" fill="#0f172a" stroke="#a78bfa" strokeWidth="2" />
                </marker>

                <marker id="uml-composition" markerWidth="18" markerHeight="12" refX="0" refY="6" orient="auto">
                  <path d="M0,6 L9,0 L18,6 L9,12 Z" fill="#f87171" />
                </marker>

                <marker id="uml-aggregation" markerWidth="18" markerHeight="12" refX="0" refY="6" orient="auto">
                  <path d="M0,6 L9,0 L18,6 L9,12 Z" fill="#0f172a" stroke="#fbbf24" strokeWidth="2" />
                </marker>

                <marker id="uml-association" markerWidth="14" markerHeight="12" refX="13" refY="6" orient="auto">
                  <path d="M1,1 L13,6 L1,11" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>

              {/* Rendered Edges */}
              {renderedEdges.map((edge) => (
                <ConnectionLine
                  key={edge.id}
                  edge={edge}
                  isSelected={selectedEdgeId === edge.id}
                  onSelect={(id) => {
                    setSelectedEdgeId(id);
                    setSelectedId(null);
                  }}
                />
              ))}

              {/* Temporary connection line while dragging */}
              {tempConnection && connectionState && (
                <line
                  x1={tempConnection.startX}
                  y1={tempConnection.startY}
                  x2={tempConnection.endX}
                  y2={tempConnection.endY}
                  stroke={RELATIONSHIP_TYPES[connectionState.type].color}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  className="pointer-events-none animate-pulse"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))' }}
                />
              )}
            </svg>

            {/* Nodes Layer */}
            {nodes.map(node => (
              <UMLClassNode 
                key={node.id} 
                node={node} 
                isSelected={selectedId === node.id} 
                connectionMode={!!connectionState}
                onSelect={(id) => {
                  setSelectedId(id);
                  setSelectedEdgeId(null);
                }} 
                onDragStart={startDragging}
                onAnchorClick={handleAnchorClick}
                activeStartAnchor={connectionState?.fromId === node.id ? connectionState.fromAnchor : null}
                activeEndAnchor={null}
                isConnectionSource={connectionState?.fromId === node.id}
                isConnectionTarget={!!connectionState && connectionState.fromId !== node.id}
              />
            ))}
          </div>
        </div>
        
        {/* HUD Controls - Pan */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-50">
          <div className="grid grid-cols-3 gap-1 bg-slate-900/95 p-2 rounded-2xl border border-slate-800 backdrop-blur-lg shadow-2xl">
            <div />
            <button 
              onClick={() => setPan(p => ({...p, y: p.y + 50}))} 
              className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all text-slate-400 hover:text-white"
              title="Pan Up"
            >
              <ChevronUp size={16}/>
            </button>
            <div />
            <button 
              onClick={() => setPan(p => ({...p, x: p.x + 50}))} 
              className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all text-slate-400 hover:text-white"
              title="Pan Left"
            >
              <ChevronLeft size={16}/>
            </button>
            <button 
              onClick={() => { setZoom(1); setPan({x:0, y:0}); }} 
              className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white shadow-lg transition-all"
              title="Reset View"
            >
              <Maximize size={16}/>
            </button>
            <button 
              onClick={() => setPan(p => ({...p, x: p.x - 50}))} 
              className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all text-slate-400 hover:text-white"
              title="Pan Right"
            >
              <ChevronRight size={16}/>
            </button>
            <div />
            <button 
              onClick={() => setPan(p => ({...p, y: p.y - 50}))} 
              className="p-2 bg-slate-800 hover:bg-indigo-600 rounded-lg transition-all text-slate-400 hover:text-white"
              title="Pan Down"
            >
              <ChevronDown size={16}/>
            </button>
            <div />
          </div>
        </div>

        {/* HUD Controls - Zoom */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-50 bg-slate-900/95 p-2 rounded-xl border border-slate-800 backdrop-blur-lg shadow-2xl">
          <button 
            onClick={() => setZoom(z => Math.max(z - 0.1, MIN_ZOOM))} 
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={16}/>
          </button>
          <div className="px-4 py-1 bg-slate-800 rounded text-xs font-black text-indigo-400 min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </div>
          <button 
            onClick={() => setZoom(z => Math.min(z + 0.1, MAX_ZOOM))} 
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Zoom In"
          >
            <ZoomIn size={16}/>
          </button>
        </div>
      </main>

      {/* INSPECTOR PANEL */}
      <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-50 overflow-y-auto shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 sticky top-0 z-10 backdrop-blur">
          <Info size={16} className="text-indigo-400" />
          <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">Properties</span>
        </div>
        
        <div className="flex-1 p-5">
          <PropertyInspector
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            nodes={nodes}
            edges={edges}
            onUpdateNode={(id, updates) => {
              setNodes(prev => prev.map(n => 
                n.id === id ? { ...n, data: { ...n.data, ...updates } } : n
              ));
            }}
            onUpdateEdge={(id, updates) => {
              setEdges(prev => prev.map(e => 
                e.id === id ? { ...e, ...updates } : e
              ));
            }}
            onDeleteAttribute={(nodeId, index) => {
              setNodes(prev => prev.map(n => 
                n.id === nodeId 
                  ? { ...n, data: { ...n.data, attributes: n.data.attributes.filter((_, i) => i !== index) } }
                  : n
              ));
            }}
            onDeleteOperation={(nodeId, index) => {
              setNodes(prev => prev.map(n => 
                n.id === nodeId 
                  ? { ...n, data: { ...n.data, operations: n.data.operations.filter((_, i) => i !== index) } }
                  : n
              ));
            }}
            onEditMember={(form) => {
              setMemberForm(form);
              setActiveModal('member');
            }}
            onDeleteSelection={deleteSelection}
            onStartConnection={(fromId, type) => {
              setConnectionState({ fromId, type, fromAnchor: null });
            }}
            connectionState={connectionState}
          />
        </div>
      </aside>

      {/* MODALS */}
      {activeModal === 'entity' && (
        <EntityModal
          form={entityForm}
          onFormChange={setEntityForm}
          onSubmit={createEntity}
          onClose={() => setActiveModal(null)}
        />
      )}
      
      {activeModal === 'member' && (
        <MemberModal
          form={memberForm}
          onFormChange={setMemberForm}
          onSubmit={saveMember}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default App;
