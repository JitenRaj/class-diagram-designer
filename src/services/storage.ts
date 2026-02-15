// src/services/storage.ts

// src/services/storage.ts
import type { UMLNode, UMLEdge } from '../interfaces/uml';

const NODES_KEY = 'uml_nodes_v7';
const EDGES_KEY = 'uml_edges_v7';

export const storageService = {
  /**
   * Load nodes from localStorage
   */
  loadNodes(): UMLNode[] {
    const saved = localStorage.getItem(NODES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved nodes:', error);
        return [];
      }
    }
    return [];
  },

  /**
   * Save nodes to localStorage
   */
  saveNodes(nodes: UMLNode[]): void {
    try {
      localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
    } catch (error) {
      console.error('Failed to save nodes:', error);
    }
  },

  /**
   * Load edges from localStorage
   */
  loadEdges(): UMLEdge[] {
    const saved = localStorage.getItem(EDGES_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved edges:', error);
        return [];
      }
    }
    return [];
  },

  /**
   * Save edges to localStorage
   */
  saveEdges(edges: UMLEdge[]): void {
    try {
      localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
    } catch (error) {
      console.error('Failed to save edges:', error);
    }
  },

  /**
   * Clear all saved data
   */
  clearAll(): void {
    localStorage.removeItem(NODES_KEY);
    localStorage.removeItem(EDGES_KEY);
  }
};
