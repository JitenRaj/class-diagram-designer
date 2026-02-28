// src/utils/routing.ts

import type { UMLNode, PathResult, Point, AnchorPoint, UMLEdge } from '../interfaces/uml';
import { EDGE_ROUTING_CONFIG } from '../constants/config';
import { getConnectionPoints } from './geometry';

const DIR_VECTORS: Record<string, Point> = {
  n: { x: 0, y: -1 },
  ne: { x: 1, y: -1 },
  e: { x: 1, y: 0 },
  se: { x: 1, y: 1 },
  s: { x: 0, y: 1 },
  sw: { x: -1, y: 1 },
  w: { x: -1, y: 0 },
  nw: { x: -1, y: -1 }
};

const normalizeVector = (vector: Point): Point => {
  const magnitude = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / magnitude, y: vector.y / magnitude };
};

const pushPoint = (point: AnchorPoint, distance: number): AnchorPoint => {
  const unit = normalizeVector(DIR_VECTORS[point.dir] ?? { x: 0, y: 0 });
  return {
    ...point,
    x: point.x + unit.x * distance,
    y: point.y + unit.y * distance
  };
};

const roundedOrthogonalPath = (start: Point, p1: Point, p2: Point, end: Point): string => {
  const points: Point[] = [start, p1, p2, end];
  const r = EDGE_ROUTING_CONFIG.cornerRadius;
  const commands: string[] = [`M ${start.x} ${start.y}`];

  for (let i = 1; i < points.length - 1; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const lenIn = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const lenOut = Math.hypot(next.x - curr.x, next.y - curr.y);

    if (lenIn < EDGE_ROUTING_CONFIG.minSegmentLength || lenOut < EDGE_ROUTING_CONFIG.minSegmentLength) {
      commands.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    const trim = Math.min(r, lenIn / 2, lenOut / 2);
    const inUnit = normalizeVector({ x: curr.x - prev.x, y: curr.y - prev.y });
    const outUnit = normalizeVector({ x: next.x - curr.x, y: next.y - curr.y });

    const lineEnd = { x: curr.x - inUnit.x * trim, y: curr.y - inUnit.y * trim };
    const lineStart = { x: curr.x + outUnit.x * trim, y: curr.y + outUnit.y * trim };

    commands.push(`L ${lineEnd.x} ${lineEnd.y}`);
    commands.push(`Q ${curr.x} ${curr.y} ${lineStart.x} ${lineStart.y}`);
  }

  commands.push(`L ${end.x} ${end.y}`);
  return commands.join(' ');
};

/**
 * Smart orthogonal routing with rounded bends and marker-aware endpoints.
 */
export const getManhattanPath = (
  n1: UMLNode | null,
  n2: UMLNode | null,
  edgeType: UMLEdge['type'],
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

  let start: AnchorPoint | null = startAnchor ? points1[startAnchor as keyof typeof points1] : null;
  let end: AnchorPoint | null = endAnchor ? points2[endAnchor as keyof typeof points2] : null;

  if (!start || !end) {
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        start = points1.e;
        end = points2.w;
      } else {
        start = points1.w;
        end = points2.e;
      }
    } else if (dy > 0) {
      start = points1.s;
      end = points2.n;
    } else {
      start = points1.n;
      end = points2.s;
    }
  }

  const shiftedStart = pushPoint(start, EDGE_ROUTING_CONFIG.startOffsetByType[edgeType]);
  const shiftedEnd = pushPoint(end, -EDGE_ROUTING_CONFIG.endOffsetByType[edgeType]);

  let p1: Point;
  let p2: Point;

  const isHorizontalStart = ['e', 'w'].includes(start.dir);
  const isHorizontalEnd = ['e', 'w'].includes(end.dir);

  if (isHorizontalStart && isHorizontalEnd) {
    const midX = (shiftedStart.x + shiftedEnd.x) / 2;
    p1 = { x: midX, y: shiftedStart.y };
    p2 = { x: midX, y: shiftedEnd.y };
  } else if (!isHorizontalStart && !isHorizontalEnd) {
    const midY = (shiftedStart.y + shiftedEnd.y) / 2;
    p1 = { x: shiftedStart.x, y: midY };
    p2 = { x: shiftedEnd.x, y: midY };
  } else if (isHorizontalStart) {
    p1 = { x: shiftedEnd.x, y: shiftedStart.y };
    p2 = p1;
  } else {
    p1 = { x: shiftedStart.x, y: shiftedEnd.y };
    p2 = p1;
  }

  const path = roundedOrthogonalPath(shiftedStart, p1, p2, shiftedEnd);
  const center = {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };

  return { path, center, startPoint: shiftedStart, endPoint: shiftedEnd };
};
