// src/components/modals/MemberModal.tsx

import React from 'react';
import { X } from 'lucide-react';
import type { MemberForm } from '../../interfaces/uml';
import { VISIBILITY_INFO } from '../../constants/config';

interface MemberModalProps {
  form: MemberForm;
  onFormChange: (form: MemberForm) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
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
        <div className={`p-5 flex justify-between items-center ${form.typeGroup === 'attr' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}>
          <h3 className="text-sm font-black uppercase tracking-widest text-white">
            {form.index >= 0 ? 'Edit' : 'Add'} {form.typeGroup === 'attr' ? 'Attribute' : 'Operation'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2 block">
                Visibility
              </label>
              <div className="grid grid-cols-4 gap-1 bg-slate-950 rounded-lg border border-slate-800 p-1">
                {Object.entries(VISIBILITY_INFO).map(([v, info]) => (
                  <button 
                    key={v} 
                    onClick={() => onFormChange({ ...form, visibility: v as MemberForm['visibility'] })}
                    className={`py-2 text-sm font-black font-mono rounded-md transition-all
                      ${form.visibility === v 
                        ? `${info.color} bg-slate-800 scale-110` 
                        : 'text-slate-600 hover:text-slate-400'
                      }`}
                    title={info.label}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2 block">
                {form.typeGroup === 'attr' ? 'Data Type' : 'Return Type'}
              </label>
              <input 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs outline-none text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold transition-all" 
                value={form.type} 
                onChange={e => onFormChange({ ...form, type: e.target.value })}
                placeholder={form.typeGroup === 'attr' ? 'string' : 'void'} 
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-2 block">
              Name
            </label>
            <input 
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-lg p-4 text-sm outline-none text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono font-bold tracking-tight transition-all" 
              value={form.name} 
              onChange={e => onFormChange({ ...form, name: e.target.value })}
              placeholder={form.typeGroup === 'attr' ? 'e.g. userId' : 'e.g. calculate'} 
              onKeyDown={handleKeyDown}
              autoFocus 
            />
          </div>
        </div>
        
        <div className="p-4 bg-slate-950/50 flex gap-3 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors rounded-lg hover:bg-slate-900"
          >
            Cancel
          </button>
          <button 
            onClick={onSubmit}
            disabled={!form.name.trim()}
            className={`flex-1 py-3 text-xs font-black text-white rounded-lg shadow-lg uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${form.typeGroup === 'attr' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
              }`}
          >
            {form.index >= 0 ? 'Update' : 'Add'} {form.typeGroup === 'attr' ? 'Attribute' : 'Operation'}
          </button>
        </div>
      </div>
    </div>
  );
};
