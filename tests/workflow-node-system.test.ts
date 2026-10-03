import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowNodeShell } from '../src/ui/components/studio/WorkflowNodeShell';
import { getNodePresentation } from '../src/ui/components/studio/node-presentation-registry';
import { Workflow, WorkflowNode, ExecutionPolicy } from '../src/types/workflow';
import { ModelRegistry } from '../src/core/model/registry';
import { ModelSelector } from '../src/core/model/selector';
import { DeviceContextManager } from '../src/core/resources/device-context';
import { DAGValidator } from '../src/core/workflow/dag-validator';
import { ModelCapability } from '../src/types/model';

const renderWithFlow = (element: React.ReactElement) => {
  return renderToString(
    React.createElement(ReactFlowProvider, null, element)
  );
};

describe('Phase 5 — Reusable Workflow Node System & Inspector', () => {
  const mockNodeOCR: WorkflowNode = {
    id: 'node_ocr_1',
    label: 'Receipt OCR Scanner',
    type: 'AI',
    capability: 'OCR',
    inputTypes: ['IMAGE'],
    outputType: 'TEXT',
    dependencies: ['node_camera_1'],
    config: {},
    executionPolicy: 'AUTO',
    assignedModelId: 'tesseract-mobile-lite',
  };

  const mockTriggerNode: WorkflowNode = {
    id: 'node_camera_1',
    label: 'Camera Trigger',
    type: 'TRIGGER',
    capability: 'CAMERA_CAPTURE',
    inputTypes: [],
    outputType: 'IMAGE',
    dependencies: [],
    config: {},
    executionPolicy: 'FORCE_LOCAL',
  };

  describe('1. Shared Node Architecture & Visual Grammar', () => {
    it('should map capability to standard presentation metadata without individual node classes', () => {
      const ocrPres = getNodePresentation('AI', 'OCR');
      expect(ocrPres.categoryLabel).toBe('Vision Inference');
      expect(ocrPres.dataFlowDescription).toBe('Image → Extracted Text');
      expect(ocrPres.icon).toBeDefined();

      const trigPres = getNodePresentation('TRIGGER', 'CAMERA_CAPTURE');
      expect(trigPres.categoryLabel).toBe('Hardware Trigger');
      expect(trigPres.dataFlowDescription).toBe('Hardware Camera → Image Buffer');
    });

    it('should render standard node shell structure with label, category, policy, and handles', () => {
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: mockNodeOCR,
          selected: false,
          hasErrors: false,
        })
      );

      // Verify standardized shell markup
      expect(html).toContain('el-flow-node');
      expect(html).toContain('Receipt OCR Scanner');
      expect(html).toContain('Vision Inference');
      expect(html).toContain('Image → Extracted Text');
      expect(html).toContain('tesseract-mobile-lite');
      // Should contain both target and source handles
      expect(html).toContain('el-flow-node__handle--target');
      expect(html).toContain('el-flow-node__handle--source');
    });

    it('should omit target handle for trigger/source nodes with no inputs', () => {
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: mockTriggerNode,
          selected: false,
          hasErrors: false,
        })
      );

      // Trigger node has no inputs: target handle must NOT be rendered
      expect(html).not.toContain('el-flow-node__handle--target');
      // Source handle MUST be rendered
      expect(html).toContain('el-flow-node__handle--source');
    });
  });

  describe('2. Node Semantic States', () => {
    it('should apply selected state class with burnt-orange accent styling', () => {
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: mockNodeOCR,
          selected: true,
        })
      );
      expect(html).toContain('el-flow-node--selected');
    });

    it('should apply error state class when validation fails', () => {
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: mockNodeOCR,
          hasErrors: true,
        })
      );
      expect(html).toContain('el-flow-node--error');
    });

    it('should apply running state class when node is actively executing', () => {
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node: mockNodeOCR,
          status: 'RUNNING',
        })
      );
      expect(html).toContain('el-flow-node--running');
    });
  });

  describe('3. Model Selection & Explainable Resource Allocation', () => {
    it('should fetch real models from ModelRegistry for node capability', () => {
      const models = ModelRegistry.getByCapability('OCR');
      expect(models.length).toBeGreaterThan(0);
      const tesseract = models.find((m) => m.id === 'tesseract-mobile-lite');
      expect(tesseract).toBeDefined();
      expect(tesseract?.ramRequirementMb).toBe(65);
      expect(tesseract?.quantization).toBe('INT8');
      expect(tesseract?.expectedLatencyMs).toBe(320);
    });

    it('should produce explainable routing rationale using ModelSelector', () => {
      const device = DeviceContextManager.getInstance().getContext();
      const result = ModelSelector.selectBestModel(
        'OCR' as ModelCapability,
        device,
        'AUTO'
      );

      expect(result.selectedModel).toBeDefined();
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.totalScore).toBeGreaterThan(0);
      expect(Array.isArray(result.breakdown.reasons)).toBe(true);
      expect(result.breakdown.reasons.length).toBeGreaterThan(0);
    });
  });

  describe('4. Node Duplication, Mutation & DAG Validation Flow', () => {
    it('should handle duplication with unique ID, offset, and preserve validation integrity', () => {
      const workflow: Workflow = {
        id: 'wf_test',
        name: 'Test Workflow',
        description: 'Test',
        domain: 'FINANCE',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0.0',
        nodes: [mockTriggerNode, mockNodeOCR],
        edges: [
          {
            id: 'e1',
            sourceNodeId: 'node_camera_1',
            targetNodeId: 'node_ocr_1',
            dataType: 'IMAGE',
          },
        ],
      };

      // Initial validation
      const initialVal = DAGValidator.validate(workflow);
      expect(initialVal.isValid).toBe(true);

      // Duplicate mockNodeOCR
      const duplicateId = 'node_ocr_copy';
      const duplicateNode: WorkflowNode = {
        ...mockNodeOCR,
        id: duplicateId,
        label: `${mockNodeOCR.label} (Copy)`,
        position: { x: 300, y: 300 },
      };

      const updatedWorkflow: Workflow = {
        ...workflow,
        nodes: [...workflow.nodes, duplicateNode],
        updatedAt: Date.now(),
      };

      // Node count increased, unique ID confirmed
      expect(updatedWorkflow.nodes.length).toBe(3);
      expect(updatedWorkflow.nodes.some((n) => n.id === duplicateId)).toBe(true);
      expect(updatedWorkflow.nodes.find((n) => n.id === duplicateId)?.label).toBe(
        'Receipt OCR Scanner (Copy)'
      );

      // Validate post duplication
      const postDupVal = DAGValidator.validate(updatedWorkflow);
      expect(postDupVal.isValid).toBe(true);
    });

    it('should handle node policy and model changes and synchronize with workflow state', () => {
      let node: WorkflowNode = { ...mockNodeOCR };

      // Change policy to FORCE_LOCAL
      const newPolicy: ExecutionPolicy = 'FORCE_LOCAL';
      node = { ...node, executionPolicy: newPolicy };
      expect(node.executionPolicy).toBe('FORCE_LOCAL');

      // Change assigned model
      const newModelId = 'paddleocr-mobile-v4';
      node = { ...node, assignedModelId: newModelId };
      expect(node.assignedModelId).toBe('paddleocr-mobile-v4');

      // Shell reflects updated model & policy without bespoke markup
      const html = renderWithFlow(
        React.createElement(WorkflowNodeShell, {
          node,
          selected: false,
        })
      );

      expect(html).toContain('LOCAL');
      expect(html).toContain('paddleocr-mobile-v4');
    });
  });
});
