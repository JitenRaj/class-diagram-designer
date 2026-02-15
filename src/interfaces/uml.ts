// src/interfaces/uml.ts

export interface UMLAttribute {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
}

export interface UMLOperation {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  returnType: string;
}

export interface UMLNodeData {
  name: string;
  type: 'class' | 'interface' | 'enum' | 'abstract' | 'exception';
  stereotype: string;
  attributes: UMLAttribute[];
  operations: UMLOperation[];
}

export interface UMLNode {
  id: string;
  x: number;
  y: number;
  data: UMLNodeData;
}

export interface UMLEdge {
  id: string;
  from: string;
  to: string;
  type: 'association' | 'inheritance' | 'realization' | 'composition' | 'aggregation' | 'dependency';
  startMult: string;
  endMult: string;
  startAnchor: string | null;
  endAnchor: string | null;
}

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint extends Point {
  dir: string;
  key?: string;
}

export interface ConnectionPoints {
  n: AnchorPoint;
  ne: AnchorPoint;
  e: AnchorPoint;
  se: AnchorPoint;
  s: AnchorPoint;
  sw: AnchorPoint;
  w: AnchorPoint;
  nw: AnchorPoint;
}

export interface PathResult {
  path: string;
  center: Point;
  startPoint: AnchorPoint | null;
  endPoint: AnchorPoint | null;
}

export interface DragInfo {
  id: string;
  offsetX: number;
  offsetY: number;
}

export interface PanInfo {
  startX: number;
  startY: number;
}

export interface ConnectionState {
  fromId: string;
  fromAnchor: string | null;
  type: UMLEdge['type'];
}

export interface TempConnection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface EntityForm {
  name: string;
  type: UMLNodeData['type'];
}

export interface MemberForm {
  name: string;
  type: string;
  visibility: '+' | '-' | '#' | '~';
  typeGroup: 'attr' | 'op';
  index: number;
}
