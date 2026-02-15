// src/components/ui/Sidebar.tsx

import React from 'react';
import { Plus, LinkIcon, Trash2, Layout, Grid3x3 } from 'lucide-react';

interface SidebarProps {
  selectedId: string | null;
  selectedEdgeId: string | null;
  connectionState: any;
  showGrid: boolean;
  onCreateEntity: () => void;
  onStartConnection: () => void;
  onToggleGrid: () => void;
  onDelete: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedId,
  selectedEdgeId,
  connectionState,
  showGrid,
  onCreateEntity,
  onStartConnection,
  onToggleGrid,
  onDelete
}) => {
  return (
    <aside className="w-16 border-r border-slate-800 bg-slate-900 flex flex-col items-center py-6 gap-6 z-50 shadow-2xl">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
        <Layout size={20} />
      </div>
      
      <div className="flex flex-col gap-3">
        <button 
          onClick={onCreateEntity}
          className="p-3 bg-slate-800 hover:bg-indigo-600 rounded-xl text-blue-400 hover:text-white transition-all hover:scale-110 group relative shadow-lg"
          title="Create Class (Ctrl+N)"
        >
          <Plus size={20} />
          <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Create Class
          </span>
        </button>
        
        <button 
          onClick={onStartConnection}
          disabled={!selectedId}
          className={`p-3 rounded-xl transition-all hover:scale-110 group relative shadow-lg
            ${connectionState 
              ? 'bg-indigo-600 text-white animate-pulse' 
              : (selectedId ? 'bg-slate-800 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'bg-slate-800/50 text-slate-700 opacity-50 cursor-not-allowed')
            }`}
          title="Connect Classes (L)"
        >
          <LinkIcon size={20} />
          {selectedId && !connectionState && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Connect
            </span>
          )}
        </button>

        <div className="w-8 h-px bg-slate-700 mx-auto my-1" />

        <button 
          onClick={onToggleGrid}
          className={`p-3 rounded-xl transition-all hover:scale-110 group relative shadow-lg
            ${showGrid ? 'bg-slate-700 text-slate-300' : 'bg-slate-800 text-slate-600'}`}
          title="Toggle Grid (G)"
        >
          <Grid3x3 size={20} />
        </button>
      </div>
      
      <div className="mt-auto flex flex-col gap-3">
        <button 
          onClick={onDelete}
          disabled={!selectedId && !selectedEdgeId} 
          className={`p-3 rounded-xl transition-all hover:scale-110 shadow-lg
            ${selectedId || selectedEdgeId 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' 
              : 'bg-slate-800/50 text-slate-700 opacity-30 cursor-not-allowed'
            }`}
          title="Delete (Del)"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </aside>
  );
};
