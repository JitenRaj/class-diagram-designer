// src/utils/geometry.ts

// src/utils/geometry.ts
import type { UMLNode, ConnectionPoints, AnchorPoint } from '../interfaces/uml';
import { NODE_W, NODE_H } from '../constants/config';

/**
 * Get 8 connection points around a node (cardinal + corners)
 */
export const getConnectionPoints = (node: UMLNode): ConnectionPoints => {
  const w = NODE_W;
  const h = NODE_H;
  
  return {
    n: { x: node.x + w / 2, y: node.y, dir: 'n' },
    ne: { x: node.x + w, y: node.y, dir: 'ne' },
    e: { x: node.x + w, y: node.y + h / 2, dir: 'e' },
    se: { x: node.x + w, y: node.y + h, dir: 'se' },
    s: { x: node.x + w / 2, y: node.y + h, dir: 's' },
    sw: { x: node.x, y: node.y + h, dir: 'sw' },
    w: { x: node.x, y: node.y + h / 2, dir: 'w' },
    nw: { x: node.x, y: node.y + h, dir: 'nw' }
  };
};

/**
 * Find the closest connection point to a given coordinate
 */
export const findNearestAnchor = (node: UMLNode, x: number, y: number): AnchorPoint => {
  const points = getConnectionPoints(node);
  let minDist = Infinity;
  let nearest: AnchorPoint = { x: 0, y: 0, dir: '', key: '' };
  
  Object.entries(points).forEach(([key, point]) => {
    const dist = Math.hypot(point.x - x, point.y - y);
    if (dist < minDist) {
      minDist = dist;
      nearest = { ...point, key };
    }
  });
  
  return nearest;
};

/**
 * Calculate the distance between two points
 */
export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.hypot(x2 - x1, y2 - y1);
};

/**
 * Snap a value to the nearest grid point
 */
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};
