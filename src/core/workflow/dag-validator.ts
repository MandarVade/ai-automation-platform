import { Workflow, ValidationResult, ValidationDiagnostic, DataType } from '../../types/workflow';

export class DAGValidator {
  /**
   * Validates a workflow DAG:
   * 1. Detects cycles (directed loops)
   * 2. Checks for unknown node references in edges and dependencies
   * 3. Checks data type compatibility across edges
   * 4. Computes deterministic topological execution order
   * 5. Validates trigger node presence
   */
  public static validate(workflow: Workflow): ValidationResult {
    const diagnostics: ValidationDiagnostic[] = [];
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

    // 1. Check for empty workflow
    if (workflow.nodes.length === 0) {
      return {
        isValid: false,
        diagnostics: [{ level: 'ERROR', message: 'Workflow must contain at least one node' }],
        topologicalOrder: []
      };
    }

    // 2. Validate edge node references
    for (const edge of workflow.edges) {
      if (!nodeMap.has(edge.sourceNodeId)) {
        diagnostics.push({
          level: 'ERROR',
          message: `Edge references non-existent source node: ${edge.sourceNodeId}`
        });
      }
      if (!nodeMap.has(edge.targetNodeId)) {
        diagnostics.push({
          level: 'ERROR',
          message: `Edge references non-existent target node: ${edge.targetNodeId}`
        });
      }
    }

    // 3. Build adjacency list and in-degree map for topological sort and cycle detection
    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    for (const node of workflow.nodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // Reconcile edges and node.dependencies
    const combinedEdges = new Set<string>();

    for (const edge of workflow.edges) {
      const key = `${edge.sourceNodeId}->${edge.targetNodeId}`;
      if (!combinedEdges.has(key)) {
        combinedEdges.add(key);
        adjacency.get(edge.sourceNodeId)?.push(edge.targetNodeId);
        inDegree.set(edge.targetNodeId, (inDegree.get(edge.targetNodeId) || 0) + 1);
      }
    }

    for (const node of workflow.nodes) {
      for (const depId of node.dependencies) {
        const key = `${depId}->${node.id}`;
        if (!combinedEdges.has(key) && nodeMap.has(depId)) {
          combinedEdges.add(key);
          adjacency.get(depId)?.push(node.id);
          inDegree.set(node.id, (inDegree.get(node.id) || 0) + 1);
        }
      }
    }

    // 4. Cycle Detection using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let hasCycle = false;

    const dfsCycle = (nodeId: string, path: string[]) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjacency.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsCycle(neighbor, path);
        } else if (recursionStack.has(neighbor)) {
          hasCycle = true;
          diagnostics.push({
            nodeId: neighbor,
            level: 'ERROR',
            message: `Cyclic dependency detected: ${[...path, neighbor].join(' -> ')}`
          });
        }
      }

      recursionStack.delete(nodeId);
      path.pop();
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        dfsCycle(node.id, []);
      }
    }

    // 5. Check data type compatibility
    for (const edge of workflow.edges) {
      const srcNode = nodeMap.get(edge.sourceNodeId);
      const tgtNode = nodeMap.get(edge.targetNodeId);

      if (srcNode && tgtNode) {
        const srcOut = srcNode.outputType;
        const tgtIn = tgtNode.inputTypes;

        if (srcOut !== 'ANY' && !tgtIn.includes('ANY') && !tgtIn.includes(srcOut)) {
          // Check for permissible automated conversions
          const isCompatible = this.isDataConvertible(srcOut, tgtIn);
          if (!isCompatible) {
            diagnostics.push({
              nodeId: tgtNode.id,
              level: 'ERROR',
              message: `Type mismatch: Node "${srcNode.label}" outputs ${srcOut}, but Node "${tgtNode.label}" expects [${tgtIn.join(', ')}]`
            });
          }
        }
      }
    }

    // 6. Check for trigger presence
    const hasTrigger = workflow.nodes.some((n) => n.type === 'TRIGGER');
    if (!hasTrigger) {
      diagnostics.push({
        level: 'WARNING',
        message: 'Workflow has no explicit TRIGGER node. Will default to MANUAL start.'
      });
    }

    // 7. Topological Order via Kahn's Algorithm
    const queue: string[] = [];
    const topologicalOrder: string[] = [];
    const inDegreeCopy = new Map(inDegree);

    for (const [nodeId, deg] of inDegreeCopy.entries()) {
      if (deg === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      // Sort queue to guarantee stable, deterministic execution order
      queue.sort();
      const curr = queue.shift()!;
      topologicalOrder.push(curr);

      const neighbors = adjacency.get(curr) || [];
      for (const neighbor of neighbors) {
        const currentDeg = inDegreeCopy.get(neighbor)! - 1;
        inDegreeCopy.set(neighbor, currentDeg);
        if (currentDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    if (topologicalOrder.length !== workflow.nodes.length && !hasCycle) {
      diagnostics.push({
        level: 'ERROR',
        message: 'Graph contains unreachable or circularly dependent subgraphs'
      });
    }

    const hasErrors = diagnostics.some((d) => d.level === 'ERROR');

    return {
      isValid: !hasErrors,
      diagnostics,
      topologicalOrder: hasErrors ? [] : topologicalOrder
    };
  }

  private static isDataConvertible(from: DataType, toList: DataType[]): boolean {
    if (toList.includes(from)) return true;
    // Allow JSON to TEXT serialization
    if (from === 'STRUCTURED_JSON' && toList.includes('TEXT')) return true;
    // Allow NUMERIC to TEXT serialization
    if (from === 'NUMERIC' && toList.includes('TEXT')) return true;
    // Allow FILE to IMAGE or AUDIO if parsed
    if (from === 'FILE' && (toList.includes('IMAGE') || toList.includes('AUDIO_STREAM'))) return true;
    return false;
  }
}
