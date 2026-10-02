import { DeviceContext } from '../../types/device';
import { ModelSpec, ExecutionLocation } from '../../types/model';
import { ExecutionPolicy } from '../../types/workflow';

export interface RoutingDecision {
  targetLocation: ExecutionLocation;
  mode: 'LOCAL' | 'CLOUD' | 'HYBRID';
  reasoning: string[];
  fallbackCandidateId?: string;
  isFallback: boolean;
}

export class ExecutionRouter {
  public static decideRoute(
    model: ModelSpec,
    device: DeviceContext,
    policy: ExecutionPolicy,
    isRetryAttempt: boolean = false
  ): RoutingDecision {
    const reasons: string[] = [];

    // 1. Check strict policy overrides
    if (policy === 'FORCE_LOCAL') {
      reasons.push('Policy constraint: User enforced ON-DEVICE local inference.');
      return {
        targetLocation: device.hasNpu ? 'LOCAL_NPU' : device.hasGpu ? 'LOCAL_GPU' : 'LOCAL_CPU',
        mode: 'LOCAL',
        reasoning: reasons,
        isFallback: false
      };
    }

    if (policy === 'FORCE_CLOUD') {
      if (device.networkState === 'OFFLINE') {
        throw new Error('Routing failure: Node policy enforced Cloud, but device is OFFLINE.');
      }
      reasons.push('Policy constraint: User enforced CLOUD inference endpoint.');
      return {
        targetLocation: 'CLOUD',
        mode: 'CLOUD',
        reasoning: reasons,
        isFallback: false
      };
    }

    // 2. Offline / Privacy constraints
    if (device.networkState === 'OFFLINE' || !device.allowCloudInference) {
      const privacyReason = !device.allowCloudInference
        ? 'Local-first privacy policy prohibits outbound data transmission.'
        : 'Network connection unavailable (Device OFFLINE).';
      reasons.push(privacyReason);
      reasons.push('Routed strictly to on-device hardware runtime.');

      return {
        targetLocation: device.hasNpu ? 'LOCAL_NPU' : device.hasGpu ? 'LOCAL_GPU' : 'LOCAL_CPU',
        mode: 'LOCAL',
        reasoning: reasons,
        isFallback: false
      };
    }

    // 3. Resource-Aware Dynamic Routing
    const ramDeficit = model.isLocalAvailable && model.ramRequirementMb > device.availableRamMb;

    if (ramDeficit) {
      if (device.allowCloudInference) {
        reasons.push(`RAM deficit detected: Model needs ${model.ramRequirementMb}MB, but only ${device.availableRamMb}MB free.`);
        reasons.push('Autonomous Cloud Offloading activated to prevent Android OOM crash.');
        return {
          targetLocation: 'CLOUD',
          mode: 'CLOUD',
          reasoning: reasons,
          isFallback: true
        };
      }
    }

    // 4. Battery / Power conservation routing
    if ((device.batteryPercentage < 20 || policy === 'BATTERY_CONSERVE') && !device.isCharging) {
      if (model.batteryImpact === 'HIGH' && device.networkState === 'WIFI_HIGH_SPEED') {
        reasons.push('Critical battery preservation: Offloading compute-heavy transformer to cloud via Wi-Fi.');
        return {
          targetLocation: 'CLOUD',
          mode: 'CLOUD',
          reasoning: reasons,
          isFallback: false
        };
      }
    }

    // 5. Default: Best fit based on model availability
    if (model.isLocalAvailable) {
      reasons.push('Sufficient RAM & hardware delegate available for fast zero-latency local execution.');
      return {
        targetLocation: device.hasNpu ? 'LOCAL_NPU' : device.hasGpu ? 'LOCAL_GPU' : 'LOCAL_CPU',
        mode: 'LOCAL',
        reasoning: reasons,
        isFallback: false
      };
    } else {
      reasons.push('Model operates natively in Cloud runtime. Connecting via secure Android HTTPS tunnel.');
      return {
        targetLocation: 'CLOUD',
        mode: 'CLOUD',
        reasoning: reasons,
        isFallback: false
      };
    }
  }
}
