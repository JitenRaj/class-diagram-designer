import React from 'react';
import { FileCode2 } from 'lucide-react';

interface LiveCodeParserModalProps {
  value: string;
  onChange: (value: string) => void;
  onParse: () => void;
  onClose: () => void;
}

export const LiveCodeParserModal: React.FC<LiveCodeParserModalProps> = ({
  value,
  onChange,
  onParse,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="w-full max-w-3xl mx-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 size={18} className="text-indigo-400" />
            <h2 className="text-sm font-bold tracking-wide text-slate-100">Live Code Parser</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold">Close</button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-400">
            Paste Mermaid class diagram syntax. Supports inheritance (&lt;|--) and member extraction from
            both inline and block class declarations.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-72 bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            spellCheck={false}
          />
        </div>

        <div className="px-5 py-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/80">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onParse}
            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Parse & Render
          </button>
        </div>
      </div>
    </div>
  );
};
