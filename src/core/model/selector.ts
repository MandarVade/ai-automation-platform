import { ModelCapability, ModelSpec, ModelScoreBreakdown, ExecutionLocation } from '../../types/model';
import { DeviceContext } from '../../types/device';
import { ExecutionPolicy } from '../../types/workflow';
import { ModelRegistry } from './registry';

export interface SelectionResult {
  selectedModel: ModelSpec;
  breakdown: ModelScoreBreakdown;
  allCandidates: ModelScoreBreakdown[];
}

export class ModelSelector {
  /**
   * Evaluates and ranks models for a required capability given the current device context and node policy.
   * Produces explainable selection scores and rationale.
   */
  public static selectBestModel(
    capability: ModelCapability,
    device: DeviceContext,
    policy: ExecutionPolicy = 'AUTO',
    explicitModelId?: string
  ): SelectionResult {
    const candidates = ModelRegistry.getByCapability(capability);

    if (candidates.length === 0) {
      throw new Error(`No models registered in registry for capability: ${capability}`);
    }

    // If a specific model was pinned by the user in the visual builder
    if (explicitModelId) {
      const explicit = candidates.find((m) => m.id === explicitModelId);
      if (explicit) {
        const breakdown = this.scoreModel(explicit, device, policy);
        breakdown.selected = true;
        breakdown.reasons.unshift('User explicitly pinned this model in node configuration.');
        return {
          selectedModel: explicit,
          breakdown,
          allCandidates: [breakdown]
        };
      }
    }

    const evaluated: ModelScoreBreakdown[] = candidates.map((model) =>
      this.scoreModel(model, device, policy)
    );

    // Sort by total score descending (disqualified models sink to bottom)
    evaluated.sort((a, b) => b.totalScore - a.totalScore);

    const winner = evaluated[0];
    winner.selected = true;

    const selectedModel = candidates.find((m) => m.id === winner.modelId)!;

    return {
      selectedModel,
      breakdown: winner,
      allCandidates: evaluated
    };
  }

  private static scoreModel(
    model: ModelSpec,
    device: DeviceContext,
    policy: ExecutionPolicy
  ): ModelScoreBreakdown {
    const reasons: string[] = [];
    let disqualificationReason: string | undefined;

    // --- Disqualification checks ---
    if (model.isCloudAvailable && !model.isLocalAvailable) {
      if (policy === 'FORCE_LOCAL') {
        disqualificationReason = 'Rejected: Node policy strictly enforces Local On-Device execution.';
      } else if (!device.allowCloudInference) {
        disqualificationReason = 'Rejected: System privacy settings prohibit Cloud Inference.';
      } else if (device.networkState === 'OFFLINE') {
        disqualificationReason = 'Rejected: Device is currently OFFLINE; cloud endpoint unreachable.';
      }
    }

    if (model.isLocalAvailable && !model.isCloudAvailable) {
      if (policy === 'FORCE_CLOUD') {
        disqualificationReason = 'Rejected: Node policy strictly enforces Cloud execution.';
      } else if (model.ramRequirementMb > device.availableRamMb * 0.95) {
        disqualificationReason = `Rejected: Insufficient RAM. Requires ${model.ramRequirementMb}MB, but only ${device.availableRamMb}MB available.`;
      }
    }

    // --- Component Scoring ---
    const capabilityFit = 100;
    const accuracyScore = Math.round(model.qualityScore * 100);

    // Latency Score (lower latency -> higher score up to 100)
    let latencyScore = Math.max(10, Math.round(100 - (model.expectedLatencyMs / 3000) * 80));

    // Hardware Fit Score
    let hardwareFitScore = 50;
    let location: ExecutionLocation = 'LOCAL_CPU';

    if (model.isCloudAvailable && !model.isLocalAvailable) {
      location = 'CLOUD';
      hardwareFitScore = device.networkState === 'WIFI_HIGH_SPEED' ? 85 : 60;
    } else {
      if (device.hasNpu && model.supportedDelegates.includes('NNAPI')) {
        hardwareFitScore = 100;
        location = 'LOCAL_NPU';
        reasons.push('Hardware NPU acceleration active via Android NNAPI delegate.');
      } else if (device.hasGpu && (model.supportedDelegates.includes('GPU_VULKAN') || model.supportedDelegates.includes('GPU_OPENCL'))) {
        hardwareFitScore = 85;
        location = 'LOCAL_GPU';
        reasons.push('Hardware GPU acceleration active via Vulkan/OpenCL delegate.');
      } else {
        hardwareFitScore = 60;
        location = 'LOCAL_CPU';
        reasons.push('Running on CPU with multi-threaded vector instructions.');
      }
    }

    // Battery Fit Score
    let batteryFitScore = 70;
    if (model.batteryImpact === 'LOW') {
      batteryFitScore = 100;
      reasons.push('Energy-efficient execution profile minimizes battery draw.');
    } else if (model.batteryImpact === 'MEDIUM') {
      batteryFitScore = 70;
    } else {
      // HIGH battery impact
      if (device.batteryPercentage < 25 && !device.isCharging) {
        batteryFitScore = 20;
        reasons.push('Warning: High battery draw model under low battery reserve.');
      } else {
        batteryFitScore = 50;
      }
    }

    // Memory Fit Score
    let memoryFitScore = 50;
    if (model.isLocalAvailable) {
      const ramRatio = model.ramRequirementMb / Math.max(1, device.availableRamMb);
      memoryFitScore = Math.max(10, Math.round((1 - ramRatio) * 100));
      reasons.push(`RAM footprint: ${model.ramRequirementMb}MB fits within available ${device.availableRamMb}MB.`);
    } else {
      // Cloud model consumes negligible local memory
      memoryFitScore = 95;
      reasons.push('Cloud execution preserves local RAM headroom.');
    }

    // Availability Score
    const availabilityScore = model.isLocalAvailable ? 100 : device.networkState === 'WIFI_HIGH_SPEED' ? 95 : 75;

    // Resource Penalty (Thermals, Metered Network, Power Saver)
    let resourcePenalty = 0;

    if (device.thermalStatus === 'SEVERE' || device.thermalStatus === 'CRITICAL') {
      if (model.isLocalAvailable && model.batteryImpact !== 'LOW') {
        resourcePenalty += 40;
        reasons.push('Thermal throttling active: penalized high-intensity local computation.');
      }
    }

    if (device.powerSaverEnabled && model.batteryImpact === 'HIGH') {
      resourcePenalty += 30;
      reasons.push('Battery saver mode active: penalizing high-power inference.');
    }

    if (device.networkState === 'CELLULAR_METRED' && model.isCloudAvailable && !model.isLocalAvailable) {
      resourcePenalty += 25;
      reasons.push('Metered cellular connection: favoring local models over cloud transfers.');
    }

    // Total Score Calculation (Weights: Capability 20%, Accuracy 25%, Latency 15%, HW 15%, Battery 10%, Memory 15%)
    let totalScore = Math.round(
      capabilityFit * 0.2 +
      accuracyScore * 0.25 +
      latencyScore * 0.15 +
      hardwareFitScore * 0.15 +
      batteryFitScore * 0.1 +
      memoryFitScore * 0.15 -
      resourcePenalty
    );

    if (disqualificationReason) {
      totalScore = -1000;
    }

    return {
      modelId: model.id,
      modelName: model.name,
      totalScore,
      capabilityFit,
      accuracyScore,
      latencyScore,
      hardwareFitScore,
      batteryFitScore,
      memoryFitScore,
      availabilityScore,
      resourcePenalty,
      location,
      reasons,
      disqualificationReason,
      selected: false
    };
  }
}
