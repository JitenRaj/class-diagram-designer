// src/constants/config.ts

export const NODE_W = 220;
export const NODE_H = 140;
export const GRID_SIZE = 20;
export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3;
export const CONNECTION_POINT_RADIUS = 6;

export const RELATIONSHIP_TYPES = {
  association: { 
    label: 'Association', 
    stroke: 'solid', 
    markerEnd: 'url(#uml-association)',
    hint: 'Structural link between classes',
    color: '#60a5fa',
    hotkey: '1'
  },
  inheritance: { 
    label: 'Inheritance', 
    stroke: 'solid', 
    markerEnd: 'url(#uml-inheritance)',
    hint: 'IS-A relationship (extends)',
    color: '#a78bfa',
    hotkey: '2'
  },
  realization: { 
    label: 'Realization', 
    stroke: 'dashed', 
    markerEnd: 'url(#uml-inheritance)',
    hint: 'Interface implementation',
    color: '#34d399',
    hotkey: '3'
  },
  composition: { 
    label: 'Composition', 
    stroke: 'solid', 
    markerStart: 'url(#uml-composition)',
    hint: 'Strong ownership (lifecycle bound)',
    color: '#f87171',
    hotkey: '4'
  },
  aggregation: { 
    label: 'Aggregation', 
    stroke: 'solid', 
    markerStart: 'url(#uml-aggregation)',
    hint: 'Weak ownership (shared)',
    color: '#fbbf24',
    hotkey: '5'
  },
  dependency: { 
    label: 'Dependency', 
    stroke: 'dashed', 
    markerEnd: 'url(#uml-association)',
    hint: 'Temporary usage relationship',
    color: '#94a3b8',
    hotkey: '6'
  }
} as const;

export const VISIBILITY_INFO = {
  '+': { label: 'Public', desc: 'Accessible everywhere', color: 'text-green-400' },
  '-': { label: 'Private', desc: 'Class-internal only', color: 'text-red-400' },
  '#': { label: 'Protected', desc: 'Subclasses only', color: 'text-yellow-400' },
  '~': { label: 'Package', desc: 'Package-internal', color: 'text-blue-400' }
} as const;

export const THEMES = {
  class: { 
    border: 'border-blue-500', 
    header: 'bg-blue-600', 
    bg: 'bg-blue-950/30', 
    color: 'text-blue-400',
    glow: 'shadow-blue-500/20'
  },
  interface: { 
    border: 'border-emerald-500', 
    header: 'bg-emerald-600', 
    bg: 'bg-emerald-950/30', 
    color: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
  enum: { 
    border: 'border-purple-500', 
    header: 'bg-purple-600', 
    bg: 'bg-purple-950/30', 
    color: 'text-purple-400',
    glow: 'shadow-purple-500/20'
  },
  abstract: { 
    border: 'border-amber-600', 
    header: 'bg-amber-600', 
    bg: 'bg-amber-950/30', 
    color: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  exception: { 
    border: 'border-red-500', 
    header: 'bg-red-600', 
    bg: 'bg-red-950/30', 
    color: 'text-red-400',
    glow: 'shadow-red-500/20'
  }
} as const;
