// src/components/modals/EntityModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import type { EntityForm } from '../../interfaces/uml';
import { THEMES } from '../../constants/config';

interface EntityModalProps {
  form: EntityForm;
  onFormChange: (form: EntityForm) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const EntityModal: React.FC<EntityModalProps> = ({
  form,
  onFormChange,
  onSubmit,
  onClose
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && form.name.trim()) {
      onSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex justify-between items-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            Create New Class
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-3 block">
              Class Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(THEMES).map(([t, theme]) => (
                <button 
                  key={t} 
                  onClick={() => onFormChange({ ...form, type: t as EntityForm['type'] })}
                  className={`py-3 text-xs font-black rounded-lg border-2 capitalize transition-all
                    ${form.type === t 
                      ? `${theme.header} border-white/50 text-white shadow-xl scale-105` 
                      : `bg-slate-950 border-slate-800 ${theme.color} opacity-60 hover:opacity-100 hover:scale-105`
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2 block">
              Class Name
            </label>
            <input 
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-lg p-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white font-bold tracking-tight transition-all" 
              placeholder="Enter class name..." 
              value={form.name} 
              onChange={e => onFormChange({ ...form, name: e.target.value })}
              onKeyDown={handleKeyDown}
              autoFocus 
            />
          </div>
        </div>
        
        <div className="p-4 bg-slate-950/50 flex gap-3 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-xs font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors rounded-lg hover:bg-slate-900"
          >
            Cancel
          </button>
          <button 
            onClick={onSubmit}
            disabled={!form.name.trim()}
            className="flex-1 py-3 text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-lg uppercase tracking-widest transition-all"
          >
            Create Class
          </button>
        </div>
      </div>
    </div>
  );
};
