// src/components/inspector/MemberList.tsx

import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { UMLAttribute, UMLOperation } from '../../interfaces/uml';
import { VISIBILITY_INFO } from '../../constants/config';

interface MemberListProps {
  title: string;
  members: UMLAttribute[] | UMLOperation[];
  type: 'attr' | 'op';
  count: number;
  color: string;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  title,
  members,
  type,
  count,
  color,
  onAdd,
  onEdit,
  onDelete
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="text-xs text-slate-400 font-bold uppercase tracking-wide">
          {title}
          <span className={`ml-2 font-mono text-[10px] ${color}`}>
            {count}
          </span>
        </label>
        <button 
          onClick={onAdd}
          className={`p-1.5 ${type === 'attr' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-emerald-600 hover:bg-emerald-500'} rounded-lg text-white transition-all`}
        >
          <Plus size={14}/>
        </button>
      </div>
      
      <div className="space-y-1.5">
        {members.length === 0 ? (
          <div className="p-6 bg-slate-950/50 rounded-lg border-2 border-dashed border-slate-800 text-center">
            <span className="text-xs text-slate-600 italic">
              No {type === 'attr' ? 'attributes' : 'operations'} defined
            </span>
          </div>
        ) : (
          members.map((member, i) => {
            const isOperation = 'returnType' in member;
            const displayType = isOperation ? member.returnType : member.type;
            
            return (
              <div 
                key={i} 
                className={`group flex items-center justify-between bg-slate-950/50 p-3 rounded-lg border border-slate-800 hover:border-${type === 'attr' ? 'indigo' : 'emerald'}-500/50 transition-all`}
              >
                <div className="flex items-center gap-2 text-slate-300 font-medium overflow-hidden flex-1">
                  <span className={`font-black shrink-0 ${VISIBILITY_INFO[member.visibility]?.color || 'text-slate-400'}`}>
                    {member.visibility}
                  </span>
                  <span className="truncate text-xs">
                    <span className="font-mono">{member.name}{isOperation ? '()' : ''}</span>
                    <span className="text-slate-600 mx-1">:</span>
                    <span className="text-slate-500">{displayType}</span>
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button 
                    onClick={() => onEdit(i)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 rounded transition-all"
                  >
                    <Edit2 size={12}/>
                  </button>
                  <button 
                    onClick={() => onDelete(i)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-all"
                  >
                    <Trash2 size={12}/>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
