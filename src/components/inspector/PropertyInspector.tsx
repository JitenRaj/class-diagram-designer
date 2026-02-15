// src/components/inspector/PropertyInspector.tsx

import React from 'react';
import { Layout, LinkIcon, Trash2 } from 'lucide-react';
import type { UMLNode, UMLEdge, MemberForm } from '../../interfaces/uml';
import { THEMES, RELATIONSHIP_TYPES } from '../../constants/config';
import { MemberList } from './MemberList';

interface PropertyInspectorProps {
  selectedNode: UMLNode | null;
  selectedEdge: UMLEdge | null;
  nodes: UMLNode[];
  edges: UMLEdge[];
  onUpdateNode: (id: string, updates: Partial<UMLNode['data']>) => void;
  onUpdateEdge: (id: string, updates: Partial<UMLEdge>) => void;
  onDeleteAttribute: (nodeId: string, index: number) => void;
  onDeleteOperation: (nodeId: string, index: number) => void;
  onEditMember: (form: MemberForm) => void;
  onDeleteSelection: () => void;
  onStartConnection: (fromId: string, type: UMLEdge['type']) => void;
  connectionState: { fromId: string; type: UMLEdge['type'] } | null;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedNode,
  selectedEdge,
  nodes: _nodes,
  edges: _edges,
  onUpdateNode,
  onUpdateEdge,
  onDeleteAttribute,
  onDeleteOperation,
  onEditMember,
  onDeleteSelection,
  onStartConnection,
  connectionState
}) => {
  if (selectedNode) {
    const theme = THEMES[selectedNode.data.type] || THEMES.class;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        {/* Node Info Card */}
        <div className={`p-4 rounded-xl border-2 ${theme.border} bg-gradient-to-br from-slate-800 to-slate-900`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg ${theme.header} flex items-center justify-center`}>
              <Layout size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                {selectedNode.data.type}
              </div>
              <input 
                className="w-full bg-transparent border-none text-base font-bold text-white outline-none focus:ring-0 p-0 -ml-1" 
                value={selectedNode.data.name} 
                onChange={(e) => onUpdateNode(selectedNode.id, { name: e.target.value })}
                placeholder="Class name"
              />
            </div>
          </div>
          
          {/* Type Selector */}
          <div className="flex gap-1">
            {Object.keys(THEMES).map(type => (
              <button
                key={type}
                onClick={() => onUpdateNode(selectedNode.id, { type: type as any })}
                className={`flex-1 py-1.5 text-[9px] font-bold rounded transition-all capitalize
                  ${selectedNode.data.type === type
                    ? `${THEMES[type as keyof typeof THEMES].header} text-white`
                    : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Attributes */}
        <MemberList
          title="Attributes"
          members={selectedNode.data.attributes}
          type="attr"
          count={selectedNode.data.attributes.length}
          color="text-indigo-400"
          onAdd={() => onEditMember({ name: '', type: 'string', visibility: '+', typeGroup: 'attr', index: -1 })}
          onEdit={(index) => {
            const attr = selectedNode.data.attributes[index];
            onEditMember({ ...attr, typeGroup: 'attr', index });
          }}
          onDelete={(index) => onDeleteAttribute(selectedNode.id, index)}
        />

        {/* Operations */}
        <MemberList
          title="Operations"
          members={selectedNode.data.operations}
          type="op"
          count={selectedNode.data.operations.length}
          color="text-emerald-400"
          onAdd={() => onEditMember({ name: '', type: 'void', visibility: '+', typeGroup: 'op', index: -1 })}
          onEdit={(index) => {
            const op = selectedNode.data.operations[index];
            onEditMember({ name: op.name, type: op.returnType, visibility: op.visibility, typeGroup: 'op', index });
          }}
          onDelete={(index) => onDeleteOperation(selectedNode.id, index)}
        />

        {/* Quick Connect */}
        <div className="pt-6 border-t border-slate-800">
          <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-3 block">
            Quick Connect
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(RELATIONSHIP_TYPES).map(([k, v]) => (
              <button 
                key={k} 
                onClick={() => onStartConnection(selectedNode.id, k as UMLEdge['type'])}
                className={`p-2.5 text-[10px] text-left rounded-lg font-bold transition-all border-2
                  ${connectionState?.type === k 
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg' 
                    : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                title={v.hint}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-lg leading-none opacity-60">→</span>
                  <span>{v.label}</span>
                </div>
                <div className="text-[8px] opacity-60 mt-1">Press {v.hotkey}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    const typeCfg = RELATIONSHIP_TYPES[selectedEdge.type];

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
        <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border-2 border-indigo-500/30 text-center">
          <LinkIcon size={40} className="mx-auto mb-4 text-indigo-400" />
          <h3 className="text-sm font-black uppercase mb-2 tracking-wider text-indigo-300">
            {typeCfg.label}
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            {typeCfg.hint}
          </p>
          
          {/* Relationship Type Selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {Object.entries(RELATIONSHIP_TYPES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => onUpdateEdge(selectedEdge.id, { type: k as UMLEdge['type'] })}
                className={`p-2 text-[9px] font-bold rounded-lg transition-all border
                  ${selectedEdge.type === k
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white hover:border-slate-600'
                  }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          
          {/* Multiplicity */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                Start
              </label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-white font-mono font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                value={selectedEdge.startMult} 
                onChange={(e) => onUpdateEdge(selectedEdge.id, { startMult: e.target.value })}
                placeholder="e.g. 1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                End
              </label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs outline-none text-white font-mono font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                value={selectedEdge.endMult} 
                onChange={(e) => onUpdateEdge(selectedEdge.id, { endMult: e.target.value })}
                placeholder="e.g. *"
              />
            </div>
          </div>
        </div>
        
        <button 
          onClick={onDeleteSelection}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border-2 border-red-500/30 hover:border-red-500 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg uppercase tracking-widest"
        >
          <Trash2 size={16}/> Delete Connection
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10 select-none">
      <Layout size={64} className="mb-6 text-slate-700" />
      <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-700 mb-2">
        Nothing Selected
      </p>
      <p className="text-xs text-slate-800">
        Click a class or connection to edit
      </p>
    </div>
  );
};
