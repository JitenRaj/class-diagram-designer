// src/components/canvas/UMLClassNode.tsx

import React from 'react';
import type { UMLNode, AnchorPoint } from '../../interfaces/uml';
import { THEMES, VISIBILITY_INFO } from '../../constants/config';
import { ConnectionPoints } from './ConnectionPoints';

interface UMLClassNodeProps {
  node: UMLNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  connectionMode: boolean;
  onAnchorClick: (nodeId: string, anchor: string, point: AnchorPoint) => void;
  activeStartAnchor: string | null;
  activeEndAnchor: string | null;
  isConnectionSource: boolean;
  isConnectionTarget: boolean;
}

export const UMLClassNode: React.FC<UMLClassNodeProps> = React.memo(({
  node,
  isSelected,
  onSelect,
  onDragStart,
  connectionMode,
  onAnchorClick,
  activeStartAnchor,
  activeEndAnchor,
  isConnectionSource,
  isConnectionTarget
}) => {
  const theme = THEMES[node.data.type] || THEMES.class;
  const isAbstract = node.data.type === 'abstract';
  
  const showConnectionPoints = connectionMode || isSelected;

  const stereotype = node.data.type === 'interface' ? 'interface' : 
                     node.data.type === 'abstract' ? 'abstract' : 
                     node.data.type === 'enum' ? 'enumeration' : 
                     node.data.stereotype || '';

  return (
    <div 
      id={`node-${node.id}`}
      className={`absolute w-[220px] bg-slate-900 border-2 rounded-lg shadow-2xl transition-all overflow-hidden
        ${isSelected ? `${theme.border} ring-4 ring-indigo-500/40 shadow-xl ${theme.glow} z-40` : 'border-slate-700 z-20 hover:border-slate-600'}
        ${connectionMode ? 'cursor-crosshair' : 'cursor-move'}
        ${isConnectionSource ? 'ring-2 ring-green-500/50' : ''}
        ${isConnectionTarget ? 'ring-2 ring-blue-500/50 animate-pulse' : ''}`}
      style={{ left: node.x, top: node.y }}
      onMouseDown={(e) => {
        e.stopPropagation(); 
        if (!connectionMode && e.button === 0) {
          onDragStart(e, node.id);
        }
        onSelect(node.id);
      }}
    >
      {/* Connection Points Overlay */}
      {showConnectionPoints && (
        <ConnectionPoints 
          node={node} 
          onAnchorClick={(anchor, point) => onAnchorClick(node.id, anchor, point)}
          activeAnchor={isConnectionSource ? activeStartAnchor : (isConnectionTarget ? activeEndAnchor : null)}
          isSource={isConnectionSource}
        />
      )}

      {/* Header */}
      <div className={`p-2.5 border-b border-slate-700/50 text-center ${theme.header} text-white relative`}>
        {stereotype && (
          <div className="text-[9px] font-bold uppercase tracking-widest opacity-90 mb-0.5">
            «{stereotype}»
          </div>
        )}
        <div className={`font-bold text-sm truncate ${isAbstract ? 'italic' : ''}`}>
          {node.data.name}
        </div>
      </div>
      
      {/* Attributes */}
      <div className={`p-2 min-h-[40px] border-b border-slate-700/50 ${theme.bg}`}>
        {node.data.attributes.length === 0 ? (
          <div className="text-[10px] text-slate-600 italic text-center py-1">No attributes</div>
        ) : (
          node.data.attributes.map((a, i) => (
            <div key={i} className="text-[11px] font-mono px-2 py-0.5 text-slate-200 flex items-center overflow-hidden hover:bg-slate-800/30 rounded">
              <span className={`font-bold w-4 shrink-0 ${VISIBILITY_INFO[a.visibility]?.color || 'text-slate-400'}`}>
                {a.visibility}
              </span>
              <span className="truncate">{a.name}: <span className="text-slate-400">{a.type}</span></span>
            </div>
          ))
        )}
      </div>

      {/* Operations */}
      <div className={`p-2 min-h-[40px] ${theme.bg}`}>
        {node.data.operations.length === 0 ? (
          <div className="text-[10px] text-slate-600 italic text-center py-1">No operations</div>
        ) : (
          node.data.operations.map((op, i) => (
            <div key={i} className="text-[11px] font-mono px-2 py-0.5 text-slate-200 flex items-center overflow-hidden hover:bg-slate-800/30 rounded">
              <span className={`font-bold w-4 shrink-0 ${VISIBILITY_INFO[op.visibility]?.color || 'text-slate-400'}`}>
                {op.visibility}
              </span>
              <span className="truncate">{op.name}(): <span className="text-slate-400">{op.returnType}</span></span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.node === next.node && 
         prev.isSelected === next.isSelected && 
         prev.connectionMode === next.connectionMode &&
         prev.isConnectionSource === next.isConnectionSource &&
         prev.isConnectionTarget === next.isConnectionTarget;
});

UMLClassNode.displayName = 'UMLClassNode';
