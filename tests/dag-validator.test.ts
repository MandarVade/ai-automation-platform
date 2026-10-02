import { describe, it, expect } from 'vitest';
import { DAGValidator } from '../src/core/workflow/dag-validator';
import { Workflow } from '../src/types/workflow';

describe('DAGValidator', () => {
  it('should validate a valid linear DAG and return topological order', () => {
    const validWf: Workflow = {
      id: 'wf_test_1',
      name: 'Linear Pipeline',
      description: 'Test',
      domain: 'GENERAL',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      nodes: [
        {
          id: 'n1',
          label: 'Trigger',
          type: 'TRIGGER',
          capability: 'MANUAL',
          inputTypes: [],
          outputType: 'TEXT',
          dependencies: [],
          config: {},
          executionPolicy: 'AUTO'
        },
        {
          id: 'n2',
          label: 'AI Summarizer',
          type: 'AI',
          capability: 'SUMMARIZATION',
          inputTypes: ['TEXT'],
          outputType: 'TEXT',
          dependencies: ['n1'],
          config: {},
          executionPolicy: 'AUTO'
        },
        {
          id: 'n3',
          label: 'Notification',
          type: 'ANDROID_ACTION',
          capability: 'NOTIFICATION_EMIT',
          inputTypes: ['TEXT'],
          outputType: 'TEXT',
          dependencies: ['n2'],
          config: {},
          executionPolicy: 'AUTO'
        }
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2', dataType: 'TEXT' },
        { id: 'e2', sourceNodeId: 'n2', targetNodeId: 'n3', dataType: 'TEXT' }
      ]
    };

    const result = DAGValidator.validate(validWf);
    expect(result.isValid).toBe(true);
    expect(result.topologicalOrder).toEqual(['n1', 'n2', 'n3']);
    expect(result.diagnostics.length).toBe(0);
  });

  it('should detect cycles and return diagnostic error', () => {
    const cyclicWf: Workflow = {
      id: 'wf_test_cycle',
      name: 'Cyclic Pipeline',
      description: 'Has loop',
      domain: 'GENERAL',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      nodes: [
        {
          id: 'node_a',
          label: 'Node A',
          type: 'TRIGGER',
          capability: 'MANUAL',
          inputTypes: [],
          outputType: 'TEXT',
          dependencies: [],
          config: {},
          executionPolicy: 'AUTO'
        },
        {
          id: 'node_b',
          label: 'Node B',
          type: 'AI',
          capability: 'SUMMARIZATION',
          inputTypes: ['TEXT'],
          outputType: 'TEXT',
          dependencies: ['node_a'],
          config: {},
          executionPolicy: 'AUTO'
        },
        {
          id: 'node_c',
          label: 'Node C',
          type: 'TRANSFORM',
          capability: 'TEXT_FORMATTER',
          inputTypes: ['TEXT'],
          outputType: 'TEXT',
          dependencies: ['node_b'],
          config: {},
          executionPolicy: 'AUTO'
        }
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'node_a', targetNodeId: 'node_b', dataType: 'TEXT' },
        { id: 'e2', sourceNodeId: 'node_b', targetNodeId: 'node_c', dataType: 'TEXT' },
        { id: 'e3', sourceNodeId: 'node_c', targetNodeId: 'node_a', dataType: 'TEXT' } // Cycle!
      ]
    };

    const result = DAGValidator.validate(cyclicWf);
    expect(result.isValid).toBe(false);
    expect(result.topologicalOrder.length).toBe(0);
    const hasCycleDiagnostic = result.diagnostics.some((d) => d.message.includes('Cyclic dependency detected'));
    expect(hasCycleDiagnostic).toBe(true);
  });
});
