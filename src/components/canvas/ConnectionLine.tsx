// src/components/canvas/ConnectionLine.tsx

import React from 'react';
import type { UMLEdge } from '../../interfaces/uml';
import { RELATIONSHIP_TYPES } from '../../constants/config';
import type { PathResult } from '../../interfaces/uml';

interface ConnectionLineProps {
  edge: UMLEdge & PathResult;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  edge,
  isSelected,
  onSelect
}) => {
  const typeCfg = RELATIONSHIP_TYPES[edge.type];
  const edgeColor = typeCfg.color;

  return (
    <g 
      className="pointer-events-auto cursor-pointer group"
      onClick={(e) => { 
        e.stopPropagation(); 
        onSelect(edge.id);
      }}
    >
      {/* Invisible wide hit area for easier selection */}
      <path 
        d={edge.path} 
        fill="none" 
        stroke="transparent" 
        strokeWidth="24" 
      />
      
      {/* Visible edge line */}
      <path 
        d={edge.path} 
        fill="none"
        stroke={isSelected ? '#fff' : edgeColor}
        strokeWidth={isSelected ? '3' : '2'} 
        strokeDasharray={typeCfg.stroke === 'dashed' ? '6,4' : 'none'} 
        markerEnd={(typeCfg as any).markerEnd} 
        markerStart={(typeCfg as any).markerStart} 
        strokeLinejoin="round"
        strokeLinecap="round"
        className="transition-all duration-200 group-hover:stroke-white group-hover:drop-shadow-lg"
        style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' : 'none' }}
      />
      
      {/* Multiplicity Labels */}
      {edge.path && (edge.startMult || edge.endMult) && (
        <>
          {/* Background for better readability */}
          <rect
            x={edge.center.x - 30}
            y={edge.center.y - 18}
            width="60"
            height="16"
            rx="4"
            fill="#0f172a"
            opacity="0.9"
            className="group-hover:opacity-100"
          />
          <text 
            x={edge.center.x} 
            y={edge.center.y - 6} 
            fill={isSelected ? '#fff' : edgeColor}
            fontSize="11" 
            fontWeight="bold" 
            fontFamily="monospace"
            textAnchor="middle"
            className="select-none pointer-events-none"
          >
            {edge.startMult}{edge.startMult && edge.endMult ? ' — ' : ''}{edge.endMult}
          </text>
        </>
      )}
      
      {/* Relationship type label on hover */}
      <text
        x={edge.center.x}
        y={edge.center.y + 16}
        fill="#94a3b8"
        fontSize="9"
        fontWeight="600"
        textAnchor="middle"
        className="select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {typeCfg.label}
      </text>
    </g>
  );
};
