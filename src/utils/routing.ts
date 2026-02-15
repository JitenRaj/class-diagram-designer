// src/utils/routing.ts

import type { UMLNode, PathResult, Point, AnchorPoint } from '../interfaces/uml';
import { getConnectionPoints } from './geometry';

/**
 * Smart orthogonal routing with 3-segment path
 */
export const getManhattanPath = (
  n1: UMLNode | null,
  n2: UMLNode | null,
  startAnchor?: string | null,
  endAnchor?: string | null
): PathResult => {
  if (!n1 || !n2) {
    return { 
      path: '', 
      center: { x: 0, y: 0 }, 
      startPoint: null, 
      endPoint: null 
    };
  }

  const points1 = getConnectionPoints(n1);
  const points2 = getConnectionPoints(n2);
  
  // Use specified anchors or auto-select best ones
  let start: AnchorPoint | null = startAnchor ? points1[startAnchor as keyof typeof points1] : null;
  let end: AnchorPoint | null = endAnchor ? points2[endAnchor as keyof typeof points2] : null;
  
  // Auto-select best anchors based on relative position
  if (!start || !end) {
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal preference
      if (dx > 0) {
        start = points1.e;
        end = points2.w;
      } else {
        start = points1.w;
        end = points2.e;
      }
    } else {
      // Vertical preference
      if (dy > 0) {
        start = points1.s;
        end = points2.n;
      } else {
        start = points1.n;
        end = points2.s;
      }
    }
  }

  // Calculate intermediate points for orthogonal routing
  let p1: Point;
  let p2: Point;
  
  // Determine routing based on anchor directions
  const isHorizontalStart = ['e', 'w'].includes(start.dir);
  const isHorizontalEnd = ['e', 'w'].includes(end.dir);
  
  if (isHorizontalStart && isHorizontalEnd) {
    // Both horizontal - use vertical middle segment
    const midX = (start.x + end.x) / 2;
    p1 = { x: midX, y: start.y };
    p2 = { x: midX, y: end.y };
  } else if (!isHorizontalStart && !isHorizontalEnd) {
    // Both vertical - use horizontal middle segment
    const midY = (start.y + end.y) / 2;
    p1 = { x: start.x, y: midY };
    p2 = { x: end.x, y: midY };
  } else if (isHorizontalStart) {
    // Start horizontal, end vertical
    p1 = { x: end.x, y: start.y };
    p2 = p1;
  } else {
    // Start vertical, end horizontal
    p1 = { x: start.x, y: end.y };
    p2 = p1;
  }

  const path = `M ${start.x} ${start.y} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${end.x} ${end.y}`;
  const center = { 
    x: (p1.x + p2.x) / 2, 
    y: (p1.y + p2.y) / 2 
  };

  return { path, center, startPoint: start, endPoint: end };
};
