// src/utils/routing.ts

import type { UMLNode, PathResult, Point, AnchorPoint } from '../interfaces/uml';
import { getConnectionPoints } from './geometry';

const ORTHOGONAL_BUFFER = 22;
const CORNER_RADIUS = 10;

const directionVector = (dir?: string): Point => {
  switch (dir) {
    case 'n':
      return { x: 0, y: -1 };
    case 's':
      return { x: 0, y: 1 };
    case 'e':
      return { x: 1, y: 0 };
    case 'w':
      return { x: -1, y: 0 };
    default:
      return { x: 0, y: 0 };
  }
};

const pointEq = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;

const formatNum = (n: number): string => Number(n.toFixed(2)).toString();

const roundedPathFromPoints = (points: Point[], radius = CORNER_RADIUS): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${formatNum(points[0].x)} ${formatNum(points[0].y)}`;

  let d = `M ${formatNum(points[0].x)} ${formatNum(points[0].y)}`;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const vin = { x: curr.x - prev.x, y: curr.y - prev.y };
    const vout = { x: next.x - curr.x, y: next.y - curr.y };

    const inLen = Math.hypot(vin.x, vin.y);
    const outLen = Math.hypot(vout.x, vout.y);
    const isCorner = vin.x !== 0 && vout.y !== 0 || vin.y !== 0 && vout.x !== 0;

    if (!isCorner || inLen === 0 || outLen === 0) {
      d += ` L ${formatNum(curr.x)} ${formatNum(curr.y)}`;
      continue;
    }

    const r = Math.min(radius, inLen / 2, outLen / 2);
    const inUnit = { x: vin.x / inLen, y: vin.y / inLen };
    const outUnit = { x: vout.x / outLen, y: vout.y / outLen };

    const startCurve = {
      x: curr.x - inUnit.x * r,
      y: curr.y - inUnit.y * r
    };

    const endCurve = {
      x: curr.x + outUnit.x * r,
      y: curr.y + outUnit.y * r
    };

    d += ` L ${formatNum(startCurve.x)} ${formatNum(startCurve.y)}`;
    d += ` Q ${formatNum(curr.x)} ${formatNum(curr.y)} ${formatNum(endCurve.x)} ${formatNum(endCurve.y)}`;
  }

  const last = points[points.length - 1];
  d += ` L ${formatNum(last.x)} ${formatNum(last.y)}`;
  return d;
};

const polylineMidpoint = (points: Point[]): Point => {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];

  let total = 0;
  const segments: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segments.push(len);
    total += len;
  }

  const half = total / 2;
  let acc = 0;

  for (let i = 0; i < segments.length; i++) {
    const nextAcc = acc + segments[i];
    if (nextAcc >= half && segments[i] > 0) {
      const t = (half - acc) / segments[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * t,
        y: points[i].y + (points[i + 1].y - points[i].y) * t
      };
    }
    acc = nextAcc;
  }

  return points[points.length - 1];
};

const buildOrthogonalPoints = (start: AnchorPoint, end: AnchorPoint, buffer = ORTHOGONAL_BUFFER): Point[] => {
  const startVec = directionVector(start.dir);
  const endVec = directionVector(end.dir);

  const startBuffer: Point = {
    x: start.x + startVec.x * buffer,
    y: start.y + startVec.y * buffer
  };

  const endBuffer: Point = {
    x: end.x - endVec.x * buffer,
    y: end.y - endVec.y * buffer
  };

  const isHorizontalStart = ['e', 'w'].includes(start.dir);
  const isHorizontalEnd = ['e', 'w'].includes(end.dir);

  const routePoints: Point[] = [start, startBuffer];

  if (isHorizontalStart && isHorizontalEnd) {
    const midX = (startBuffer.x + endBuffer.x) / 2;
    routePoints.push({ x: midX, y: startBuffer.y }, { x: midX, y: endBuffer.y });
  } else if (!isHorizontalStart && !isHorizontalEnd) {
    const midY = (startBuffer.y + endBuffer.y) / 2;
    routePoints.push({ x: startBuffer.x, y: midY }, { x: endBuffer.x, y: midY });
  } else if (isHorizontalStart) {
    routePoints.push({ x: endBuffer.x, y: startBuffer.y });
  } else {
    routePoints.push({ x: startBuffer.x, y: endBuffer.y });
  }

  routePoints.push(endBuffer, end);

  return routePoints.filter((point, index, arr) => index === 0 || !pointEq(point, arr[index - 1]));
};

export const generateOrthogonalPath = (start: AnchorPoint, end: AnchorPoint): string => {
  const points = buildOrthogonalPoints(start, end);
  return roundedPathFromPoints(points, CORNER_RADIUS);
};

/**
 * Smart orthogonal routing with buffered Manhattan path and rounded elbows
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

  const path = generateOrthogonalPath(start, end);
  const center = polylineMidpoint(buildOrthogonalPoints(start, end));

  return { path, center, startPoint: start, endPoint: end };
};
