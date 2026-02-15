// src/components/canvas/ConnectionPoints.tsx

import React from 'react';
import type { UMLNode, AnchorPoint } from '../../interfaces/uml';
import { getConnectionPoints } from '../../utils/geometry';

interface ConnectionPointsProps {
  node: UMLNode;
  onAnchorClick: (anchor: string, point: AnchorPoint) => void;
  activeAnchor: string | null;
  isSource: boolean;
}

export const ConnectionPoints: React.FC<ConnectionPointsProps> = ({
  node,
  onAnchorClick,
  activeAnchor,
  isSource
}) => {
  const points = getConnectionPoints(node);
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {Object.entries(points).map(([key, point]) => {
        const isActive = activeAnchor === key;
        return (
          <div
            key={key}
            className={`absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full border-2 pointer-events-auto cursor-crosshair transition-all
              ${isActive 
                ? 'bg-indigo-500 border-white scale-150 shadow-lg shadow-indigo-500/50' 
                : 'bg-slate-700 border-slate-500 hover:bg-indigo-400 hover:border-white hover:scale-125'
              }
              ${isSource ? 'z-50' : 'z-40'}`}
            style={{ left: point.x - node.x, top: point.y - node.y }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onAnchorClick(key, point);
            }}
          />
        );
      })}
    </div>
  );
};
