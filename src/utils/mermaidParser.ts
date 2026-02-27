import type { UMLNode, UMLEdge, UMLAttribute, UMLOperation } from '../interfaces/uml';
import { NODE_H, NODE_W } from '../constants/config';

const PRIMITIVE_TYPES = new Set(['int', 'bool', 'boolean', 'float', 'double', 'number', 'char', 'void', 'string']);

interface ParseNodeData {
  attributes: UMLAttribute[];
  operations: UMLOperation[];
}

export interface MermaidParseResult {
  nodes: UMLNode[];
  edges: UMLEdge[];
}

const normalizeVisibility = (value: string): UMLAttribute['visibility'] => {
  if (value === '+' || value === '-' || value === '#' || value === '~') return value;
  return '+';
};

const isMethod = (token: string): boolean => token.trim().endsWith('()');

const parseMemberLine = (rawLine: string): { kind: 'attribute' | 'operation'; value: UMLAttribute | UMLOperation } | null => {
  const line = rawLine.trim();
  if (!line) return null;

  const visibilityToken = line[0];
  const visibility = normalizeVisibility(visibilityToken);
  const content = ['+', '-', '#', '~'].includes(visibilityToken) ? line.slice(1).trim() : line;

  if (!content) return null;

  if (isMethod(content)) {
    const methodName = content.replace(/\(\)$/, '').trim();
    if (!methodName) return null;

    return {
      kind: 'operation',
      value: {
        visibility,
        name: methodName,
        returnType: 'void'
      }
    };
  }

  const [typeCandidate, ...rest] = content.split(/\s+/);
  const nameCandidate = rest.join(' ').trim();

  if (nameCandidate) {
    return {
      kind: 'attribute',
      value: {
        visibility,
        name: nameCandidate,
        type: typeCandidate
      }
    };
  }

  return {
    kind: 'attribute',
    value: {
      visibility,
      name: typeCandidate,
      type: 'string'
    }
  };
};

const ensureClass = (classes: Map<string, ParseNodeData>, className: string) => {
  if (!classes.has(className)) {
    classes.set(className, { attributes: [], operations: [] });
  }
};

export const getTypeCategory = (typeName: string): 'primitive' | 'object' => {
  return PRIMITIVE_TYPES.has(typeName.trim()) ? 'primitive' : 'object';
};

export const parseMermaidClassDiagram = (input: string): MermaidParseResult => {
  const classes = new Map<string, ParseNodeData>();
  const edges: UMLEdge[] = [];

  const lines = input
    .replace(/\\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line !== 'classDiagram');

  let activeClass: string | null = null;

  for (const line of lines) {
    if (line.startsWith('class ')) {
      const blockStart = line.match(/^class\s+([A-Za-z_][\w]*)\s*\{$/);
      if (blockStart) {
        activeClass = blockStart[1];
        ensureClass(classes, activeClass);
        continue;
      }

      const singleLine = line.match(/^class\s+([A-Za-z_][\w]*)$/);
      if (singleLine) {
        ensureClass(classes, singleLine[1]);
      }
      continue;
    }

    if (line === '}') {
      activeClass = null;
      continue;
    }

    const inheritance = line.match(/^([A-Za-z_][\w]*)\s*<\|--\s*([A-Za-z_][\w]*)$/);
    if (inheritance) {
      const [, parent, child] = inheritance;
      ensureClass(classes, parent);
      ensureClass(classes, child);
      edges.push({
        id: `e-${parent}-${child}-${edges.length}`,
        from: child,
        to: parent,
        type: 'inheritance',
        startMult: '',
        endMult: '',
        startAnchor: null,
        endAnchor: null
      });
      continue;
    }

    const inlineMember = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.+)$/);
    if (inlineMember) {
      const [, className, memberText] = inlineMember;
      ensureClass(classes, className);
      const parsedMember = parseMemberLine(memberText);
      if (parsedMember) {
        const target = classes.get(className)!;
        if (parsedMember.kind === 'attribute') target.attributes.push(parsedMember.value as UMLAttribute);
        else target.operations.push(parsedMember.value as UMLOperation);
      }
      continue;
    }

    if (activeClass) {
      const parsedMember = parseMemberLine(line);
      if (parsedMember) {
        const target = classes.get(activeClass)!;
        if (parsedMember.kind === 'attribute') target.attributes.push(parsedMember.value as UMLAttribute);
        else target.operations.push(parsedMember.value as UMLOperation);
      }
    }
  }

  const names = Array.from(classes.keys());
  const columns = Math.max(1, Math.ceil(Math.sqrt(names.length)));

  const nodes: UMLNode[] = names.map((name, index) => ({
    id: name,
    x: 80 + (index % columns) * (NODE_W + 120),
    y: 100 + Math.floor(index / columns) * (NODE_H + 140),
    data: {
      name,
      type: 'class',
      stereotype: '',
      attributes: classes.get(name)?.attributes ?? [],
      operations: classes.get(name)?.operations ?? []
    }
  }));

  return { nodes, edges };
};
