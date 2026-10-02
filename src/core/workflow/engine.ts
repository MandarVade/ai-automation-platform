import { Workflow, WorkflowNode, NodeStatus } from '../../types/workflow';
import { WorkflowExecutionReport, NodeExecutionRecord } from '../../types/execution';
import { DAGValidator } from './dag-validator';
import { DeviceContextManager } from '../resources/device-context';
import { ModelSelector } from '../model/selector';
import { ExecutionRouter } from '../routing/execution-router';
import { ModelLifecycleManager } from '../model/lifecycle';
import { IntermediateResultCache } from '../cache/result-cache';
import { AIRuntimeEngine } from '../runtime/ai-runtime';
import { AndroidActionLayer } from '../actions/android-actions';
import { ModelSpec } from '../../types/model';
import { ReceiptParser } from './receipt-parser';

export type EngineEventCallback = (
  report: WorkflowExecutionReport,
  activeNodeId?: string,
  logMessage?: string
) => void;

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private isCancelled: boolean = false;
  private currentExecutionReport: WorkflowExecutionReport | null = null;
  private listeners: Set<EngineEventCallback> = new Set();

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  public subscribe(cb: EngineEventCallback): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(activeNodeId?: string, logMessage?: string): void {
    if (this.currentExecutionReport) {
      const copy = JSON.parse(JSON.stringify(this.currentExecutionReport));
      for (const cb of this.listeners) {
        cb(copy, activeNodeId, logMessage);
      }
    }
  }

  public cancel(): void {
    this.isCancelled = true;
    if (this.currentExecutionReport && this.currentExecutionReport.status === 'RUNNING') {
      this.currentExecutionReport.status = 'CANCELLED';
      this.notify(undefined, 'Workflow execution was cancelled by user.');
    }
  }

  /**
   * Main DAG Execution Pipeline
   */
  public async executeWorkflow(
    workflow: Workflow,
    initialTriggerInput?: any
  ): Promise<WorkflowExecutionReport> {
    this.isCancelled = false;

    // 1. Pre-execution DAG Validation
    const validation = DAGValidator.validate(workflow);
    if (!validation.isValid) {
      const errMsg = `DAG Validation Failed: ${validation.diagnostics.map((d) => d.message).join('; ')}`;
      throw new Error(errMsg);
    }

    const deviceManager = DeviceContextManager.getInstance();
    const deviceSnapshot = deviceManager.getContext();

    const executionId = `exec_${Date.now()}`;
    const nodeRecords: Record<string, NodeExecutionRecord> = {};

    for (const node of workflow.nodes) {
      nodeRecords[node.id] = {
        nodeId: node.id,
        label: node.label,
        status: 'QUEUED',
        startTime: 0,
        cacheHit: false,
        logLines: ['Node queued in execution graph.']
      };
    }

    this.currentExecutionReport = {
      id: executionId,
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: 'RUNNING',
      startTime: Date.now(),
      nodeRecords,
      deviceContextSnapshot: deviceSnapshot,
      cacheHitsCount: 0,
      totalMemoryPeakMb: 0,
      finalOutputs: {}
    };

    this.notify(undefined, `Initializing workflow execution: "${workflow.name}" (${validation.topologicalOrder.length} nodes)`);

    const nodeOutputs = new Map<string, any>();
    const nodeMap = new Map(workflow.nodes.map((n) => [n.id, n]));

    const lifecycleManager = ModelLifecycleManager.getInstance();
    const resultCache = IntermediateResultCache.getInstance();
    const aiRuntime = AIRuntimeEngine.getInstance();
    const actionLayer = AndroidActionLayer.getInstance();

    let peakRam = 0;

    // 2. Sequential Execution along Topological Order
    for (const nodeId of validation.topologicalOrder) {
      if (this.isCancelled) {
        break;
      }

      const node = nodeMap.get(nodeId)!;
      const record = nodeRecords[node.id];
      record.status = 'RUNNING';
      record.startTime = Date.now();
      this.notify(node.id, `Executing step: ${node.label} [${node.type}]`);

      try {
        // Collect inputs from upstream dependencies
        let stepInput: any;
        if (node.dependencies.length === 0) {
          stepInput = initialTriggerInput ?? this.getDefaultTriggerInput(node);
        } else if (node.dependencies.length === 1) {
          stepInput = nodeOutputs.get(node.dependencies[0]);
        } else {
          stepInput = {};
          for (const depId of node.dependencies) {
            stepInput[depId] = nodeOutputs.get(depId);
          }
        }

        record.inputData = stepInput;

        // Process by Node Type
        if (node.type === 'TRIGGER') {
          record.status = 'SUCCESS';
          record.outputData = stepInput;
          record.endTime = Date.now();
          record.latencyMs = record.endTime - record.startTime;
          record.logLines.push(`Trigger fired: captured input (${typeof stepInput}).`);
          nodeOutputs.set(node.id, stepInput);
          this.notify(node.id, `Trigger complete: ${node.label}`);
          continue;
        }

        if (node.type === 'TRANSFORM') {
          const transformResult = this.executeTransform(node, stepInput);
          record.status = 'SUCCESS';
          record.outputData = transformResult;
          record.endTime = Date.now();
          record.latencyMs = record.endTime - record.startTime;
          record.logLines.push(`Transformed input: ${JSON.stringify(transformResult).substring(0, 80)}...`);
          nodeOutputs.set(node.id, transformResult);
          this.notify(node.id, `Transform complete: ${node.label}`);
          continue;
        }

        if (node.type === 'ANDROID_ACTION') {
          const actionResult = this.executeAndroidAction(node, stepInput, actionLayer);
          record.status = 'SUCCESS';
          record.outputData = actionResult;
          record.endTime = Date.now();
          record.latencyMs = record.endTime - record.startTime;
          record.logLines.push(`Android Action completed: ${JSON.stringify(actionResult).substring(0, 80)}...`);
          nodeOutputs.set(node.id, actionResult);
          this.notify(node.id, `Android Action executed: ${node.label}`);
          continue;
        }

        if (node.type === 'AI') {
          // A. Select Best Model
          const currentDevice = deviceManager.getContext();
          const selection = ModelSelector.selectBestModel(
            node.capability as any,
            currentDevice,
            node.executionPolicy,
            node.assignedModelId
          );

          let chosenModel: ModelSpec = selection.selectedModel;
          record.selectedModelId = chosenModel.id;
          record.selectedModelName = chosenModel.name;
          record.scoreBreakdown = selection.breakdown;

          record.logLines.push(`Model selected: ${chosenModel.name} (Score: ${selection.breakdown.totalScore}/100)`);
          record.logLines.push(...selection.breakdown.reasons.map((r) => `  ✓ ${r}`));

          // B. Check Deterministic Intermediate Result Cache
          const cacheKey = resultCache.generateKey(
            workflow.id,
            node.id,
            stepInput,
            chosenModel.version,
            node.config
          );

          const cached = resultCache.get(cacheKey);
          if (cached) {
            record.cacheHit = true;
            record.status = 'SUCCESS';
            record.outputData = cached.outputData;
            record.executionLocation = cached.executionLocation;
            record.ramConsumedMb = 0;
            record.endTime = Date.now();
            record.latencyMs = 4; // instantaneous retrieval
            record.logLines.push(`⚡ Cache Hit! Reused deterministic output (Key: ${cacheKey.substring(0, 22)}...).`);
            this.currentExecutionReport.cacheHitsCount++;
            nodeOutputs.set(node.id, cached.outputData);
            this.notify(node.id, `Cache Hit on ${node.label} (0ms compute)`);
            continue;
          }

          // C. Decide Route (Local vs Cloud)
          const routing = ExecutionRouter.decideRoute(chosenModel, currentDevice, node.executionPolicy);
          record.executionLocation = routing.targetLocation;
          record.logLines.push(`Routing decision: ${routing.mode} via ${routing.targetLocation}`);
          record.logLines.push(...routing.reasoning.map((r) => `  → ${r}`));

          // D. Dynamic Model Lifecycle - Load Model
          record.logLines.push(`Model Lifecycle: allocating ${chosenModel.ramRequirementMb}MB in RAM...`);
          await lifecycleManager.loadModel(chosenModel);

          const currentTotalRam = lifecycleManager.getTotalActiveRamMb();
          if (currentTotalRam > peakRam) {
            peakRam = currentTotalRam;
          }
          this.currentExecutionReport.totalMemoryPeakMb = peakRam;

          // E. Execute Real AI Inference
          let inferenceResponse;
          try {
            inferenceResponse = await aiRuntime.executeInference({
              model: chosenModel,
              location: routing.targetLocation,
              inputType: node.inputTypes[0] || 'TEXT',
              outputType: node.outputType,
              inputData: stepInput,
              parameters: node.config
            });
          } catch (inferErr: any) {
            // Failure handling & fallback recovery
            record.logLines.push(`⚠️ Primary inference failed: ${inferErr.message}`);

            if (node.fallbackPolicy?.enableCloudFallback && currentDevice.networkState !== 'OFFLINE') {
              record.fallbackTriggered = true;
              record.fallbackReason = 'Primary on-device execution failed. Autonomous Cloud Fallback triggered.';
              record.status = 'FALLBACK';
              this.notify(node.id, `Fallback triggered for ${node.label}`);

              // Execute on cloud fallback
              record.executionLocation = 'CLOUD';
              inferenceResponse = await aiRuntime.executeInference({
                model: chosenModel,
                location: 'CLOUD',
                inputType: node.inputTypes[0] || 'TEXT',
                outputType: node.outputType,
                inputData: stepInput,
                parameters: node.config
              });
            } else {
              throw inferErr;
            }
          }

          // F. Save to Intermediate Result Cache
          resultCache.set(
            cacheKey,
            workflow.id,
            node.id,
            resultCache.computeHash(JSON.stringify(stepInput)),
            chosenModel.version,
            inferenceResponse.outputData,
            record.executionLocation
          );

          record.status = 'SUCCESS';
          record.outputData = inferenceResponse.outputData;
          record.ramConsumedMb = inferenceResponse.memoryConsumedMb;
          record.endTime = Date.now();
          record.latencyMs = inferenceResponse.actualLatencyMs;
          record.logLines.push(...inferenceResponse.diagnostics);

          nodeOutputs.set(node.id, inferenceResponse.outputData);

          // G. Dynamic Model Lifecycle - Memory Awareness:
          // In mobile devices, unload heavy models if next step needs distinct model
          if (chosenModel.sizeMb > 300) {
            record.logLines.push(`Memory optimization: proactively unloading ${chosenModel.name} to free ${chosenModel.ramRequirementMb}MB.`);
            lifecycleManager.unloadModel(chosenModel.id, 'Memory conservation');
          }

          this.notify(node.id, `AI step complete: ${node.label}`);
        }
      } catch (err: any) {
        record.status = 'FAILED';
        record.error = err.message || 'Unknown node execution error';
        record.endTime = Date.now();
        record.logLines.push(`❌ Node execution error: ${record.error}`);
        this.currentExecutionReport.status = 'FAILED';
        this.currentExecutionReport.error = `Failure at step "${node.label}": ${record.error}`;
        this.notify(node.id, `Error at step "${node.label}": ${record.error}`);
        break;
      }
    }

    // Wrap up execution report
    this.currentExecutionReport.endTime = Date.now();
    this.currentExecutionReport.totalDurationMs =
      this.currentExecutionReport.endTime - this.currentExecutionReport.startTime;

    if (this.currentExecutionReport.status === 'RUNNING') {
      this.currentExecutionReport.status = 'COMPLETED';
      // Collect final leaf node outputs
      const finalOutputs: Record<string, any> = {};
      for (const [id, out] of nodeOutputs.entries()) {
        finalOutputs[id] = out;
      }
      this.currentExecutionReport.finalOutputs = finalOutputs;
    }

    this.notify(undefined, `Workflow finished: status=${this.currentExecutionReport.status} in ${this.currentExecutionReport.totalDurationMs}ms`);

    return this.currentExecutionReport;
  }

  private getDefaultTriggerInput(node: WorkflowNode): any {
    if (node.capability === 'CAMERA_CAPTURE') {
      return {
        type: 'IMAGE',
        source: 'Android Camera (CameraX)',
        resolution: '1080x1920',
        preset: 'Receipt/Bill Snapshot'
      };
    }
    if (node.capability === 'AUDIO_RECORD') {
      return {
        type: 'AUDIO_STREAM',
        source: 'Android AudioRecorder (MediaRecorder.AudioSource.MIC)',
        format: 'AAC 16kHz',
        preset: 'University Lecture Audio'
      };
    }
    return 'Default system manual trigger';
  }

  private executeTransform(node: WorkflowNode, input: any): any {
    if (node.capability === 'CALCULATE_TOTAL') {
      const rawOcrText = typeof input === 'string'
        ? input
        : input?.rawText || JSON.stringify(input);

      const parsed = ReceiptParser.parse(rawOcrText);

      return {
        vendor: parsed.merchant,
        items: parsed.items,
        subtotal: parsed.subtotal,
        tax: parsed.tax,
        total: parsed.total,
        arithmeticVerified: parsed.arithmeticVerified,
        extractionType: parsed.extractionType,
        calculatedAt: Date.now()
      };
    }
    return input;
  }

  private executeAndroidAction(node: WorkflowNode, input: any, actionLayer: AndroidActionLayer): any {
    if (node.capability === 'EXPENSE_TRACKER_STORE') {
      return actionLayer.recordExpense({
        vendor: input?.vendor || 'Retail Merchant',
        items: input?.items,
        subtotal: input?.subtotal,
        tax: input?.tax,
        total: input?.grandTotal || input?.total || 15.00,
        category: input?.category || 'General Expense'
      });
    }

    if (node.capability === 'STUDY_NOTES_STORE') {
      const filename = `Lecture_Notes_${Date.now()}.json`;
      const savedPath = actionLayer.saveFile(filename, JSON.stringify(input, null, 2));
      actionLayer.emitNotification(
        'Study Pack & Quiz Ready',
        'Study notes and 5-question quiz generated and stored in application memory.'
      );
      return { savedPath, filename };
    }

    if (node.capability === 'CARE_PLAN_STORE') {
      const filename = `Botanical_Care_Plan_${Date.now()}.txt`;
      const savedPath = actionLayer.saveFile(filename, typeof input === 'string' ? input : JSON.stringify(input));
      actionLayer.emitNotification(
        'Plant Care Plan Saved',
        'Early Blight treatment plan stored. Reminders active.'
      );
      return { savedPath, filename };
    }

    if (node.capability === 'NOTIFICATION_EMIT') {
      const text = typeof input === 'string' ? input : JSON.stringify(input).substring(0, 120);
      return actionLayer.emitNotification(node.label, text);
    }

    if (node.capability === 'SAVE_FILE') {
      const filename = `Workflow_Export_${Date.now()}.txt`;
      const path = actionLayer.saveFile(filename, JSON.stringify(input, null, 2));
      return { path };
    }

    return { action: node.label, status: 'DONE' };
  }
}
