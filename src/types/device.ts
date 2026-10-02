export type ThermalStatus = 'NOMINAL' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
export type NetworkState = 'WIFI_HIGH_SPEED' | 'CELLULAR_4G_5G' | 'CELLULAR_METRED' | 'OFFLINE';

export interface DeviceContext {
  deviceModel: string;
  androidVersion: number;
  totalRamMb: number;
  availableRamMb: number;
  batteryPercentage: number;
  isCharging: boolean;
  thermalStatus: ThermalStatus;
  networkState: NetworkState;
  hasNpu: boolean;
  hasGpu: boolean;
  cpuCores: number;
  storageAvailableMb: number;
  powerSaverEnabled: boolean;
  allowCloudInference: boolean;
}

export interface ResourceTelemetry {
  timestamp: number;
  activeModelRamMb: number;
  systemAvailableRamMb: number;
  cpuLoadPercent: number;
  activeLoadedModelIds: string[];
}
