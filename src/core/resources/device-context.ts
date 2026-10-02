import { DeviceContext, ThermalStatus, NetworkState } from '../../types/device';

export class DeviceContextManager {
  private static instance: DeviceContextManager;

  private currentContext: DeviceContext = {
    deviceModel: 'Pixel 8 Pro (Google Tensor G3)',
    androidVersion: 14,
    totalRamMb: 8192,
    availableRamMb: 3450,
    batteryPercentage: 82,
    isCharging: false,
    thermalStatus: 'NOMINAL',
    networkState: 'WIFI_HIGH_SPEED',
    hasNpu: true,
    hasGpu: true,
    cpuCores: 8,
    storageAvailableMb: 42800,
    powerSaverEnabled: false,
    allowCloudInference: true
  };

  private listeners: Set<(context: DeviceContext) => void> = new Set();

  private constructor() {
    this.initHardwareDetection();
  }

  public static getInstance(): DeviceContextManager {
    if (!DeviceContextManager.instance) {
      DeviceContextManager.instance = new DeviceContextManager();
    }
    return DeviceContextManager.instance;
  }

  private initHardwareDetection(): void {
    if (typeof navigator !== 'undefined') {
      // Browser deviceMemory API (in GB)
      const devMem = (navigator as any).deviceMemory;
      if (devMem) {
        this.currentContext.totalRamMb = Math.round(devMem * 1024);
        this.currentContext.availableRamMb = Math.round(devMem * 1024 * 0.45);
      }

      // Hardware concurrency
      if (navigator.hardwareConcurrency) {
        this.currentContext.cpuCores = navigator.hardwareConcurrency;
      }

      // Online status
      if (!navigator.onLine) {
        this.currentContext.networkState = 'OFFLINE';
      }

      // Battery API if available
      if ((navigator as any).getBattery) {
        (navigator as any).getBattery().then((battery: any) => {
          this.currentContext.batteryPercentage = Math.round(battery.level * 100);
          this.currentContext.isCharging = battery.charging;
          this.notifyListeners();

          battery.addEventListener('levelchange', () => {
            this.currentContext.batteryPercentage = Math.round(battery.level * 100);
            this.notifyListeners();
          });
          battery.addEventListener('chargingchange', () => {
            this.currentContext.isCharging = battery.charging;
            this.notifyListeners();
          });
        }).catch(() => {});
      }
    }
  }

  public getContext(): DeviceContext {
    return { ...this.currentContext };
  }

  public subscribe(callback: (context: DeviceContext) => void): () => void {
    this.listeners.add(callback);
    callback(this.getContext());
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const copy = this.getContext();
    for (const listener of this.listeners) {
      listener(copy);
    }
  }

  public updateContext(partial: Partial<DeviceContext>): void {
    this.currentContext = {
      ...this.currentContext,
      ...partial
    };
    this.notifyListeners();
  }

  // --- Quick presets for testing & judge demonstration ---

  public presetNominalHighEnd(): void {
    this.updateContext({
      deviceModel: 'Pixel 8 Pro (Google Tensor G3 + NPU)',
      totalRamMb: 12288,
      availableRamMb: 5800,
      batteryPercentage: 92,
      isCharging: false,
      thermalStatus: 'NOMINAL',
      networkState: 'WIFI_HIGH_SPEED',
      hasNpu: true,
      hasGpu: true,
      powerSaverEnabled: false,
      allowCloudInference: true
    });
  }

  public presetBudgetConstrained(): void {
    this.updateContext({
      deviceModel: 'Android Budget Device (4GB RAM)',
      totalRamMb: 4096,
      availableRamMb: 1100,
      batteryPercentage: 35,
      isCharging: false,
      thermalStatus: 'MODERATE',
      networkState: 'CELLULAR_METRED',
      hasNpu: false,
      hasGpu: true,
      powerSaverEnabled: false,
      allowCloudInference: true
    });
  }

  public presetOfflineLowBattery(): void {
    this.updateContext({
      deviceModel: 'Field Device (Offline / Battery Critical)',
      totalRamMb: 6144,
      availableRamMb: 1800,
      batteryPercentage: 14,
      isCharging: false,
      thermalStatus: 'SEVERE',
      networkState: 'OFFLINE',
      hasNpu: true,
      hasGpu: true,
      powerSaverEnabled: true,
      allowCloudInference: false
    });
  }
}
