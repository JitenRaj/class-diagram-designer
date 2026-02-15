// src/components/ui/TopBar.tsx

import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { RELATIONSHIP_TYPES } from '../../constants/config';
import type { ConnectionState } from '../../interfaces/uml';

interface TopBarProps {
  connectionState: ConnectionState | null;
  onChangeConnectionType: (type: ConnectionState['type']) => void;
  onClearCanvas: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  connectionState,
  onChangeConnectionType,
  onClearCanvas
}) => {
  return (
    <header className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-lg z-40 shadow-lg">
      <div className="flex items-center gap-6">
        <h1 className="text-xs font-black tracking-widest uppercase bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          UML Architect Pro v7.0
        </h1>
        {connectionState && (
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-lg animate-pulse">
            <MousePointer2 size={16} className="text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">
              Click anchor point to connect • Press 1-6 to change type • ESC to cancel
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {connectionState && (
          <div className="flex gap-1 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700">
            {Object.entries(RELATIONSHIP_TYPES).map(([key, type], idx) => (
              <button
                key={key}
                onClick={() => onChangeConnectionType(key as ConnectionState['type'])}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all
                  ${connectionState.type === key 
                    ? 'bg-indigo-600 text-white' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-700'
                  }`}
                title={`${type.label} (${idx + 1})`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
        
        <button 
          onClick={() => {
            if (confirm('This will delete all nodes and connections. Continue?')) {
              onClearCanvas();
            }
          }}
          className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
        >
          Clear Canvas
        </button>
      </div>
    </header>
  );
};
