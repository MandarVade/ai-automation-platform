import React, { useState } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { DeviceContext, ThermalStatus, NetworkState } from '../../types/device';
import { Button } from './Button';
import { Badge } from './Badge';
import { Sliders, X, Zap, Cpu, Battery, Wifi, Shield } from 'lucide-react';

interface DeviceResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceResourceModal: React.FC<DeviceResourceModalProps> = ({ isOpen, onClose }) => {
  const manager = DeviceContextManager.getInstance();
  const [context, setContext] = useState<DeviceContext>(manager.getContext());

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<DeviceContext>) => {
    const updated = { ...context, ...partial };
    setContext(updated);
    manager.updateContext(partial);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog max-w-2xl border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber Header */}
        <div className="modal-header bg-amber-400 border-b-2 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-black" />
            <div>
              <h3 className="text-base font-black font-mono uppercase text-black">
                DEVICE RESOURCE CONTEXT SIMULATOR
              </h3>
              <p className="text-xs font-mono font-medium text-zinc-800">
                Test autonomous model selection, routing, and fallbacks under edge constraints.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="modal-body p-5 space-y-4 font-mono text-xs">
          {/* Quick Presets */}
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase mb-2">
              DEMONSTRATION HARDWARE PROFILES:
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-[11px]"
                onClick={() => {
                  manager.presetNominalHighEnd();
                  setContext(manager.getContext());
                }}
              >
                🚀 Flagship (Pixel 8 / NPU / 12GB)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-[11px]"
                onClick={() => {
                  manager.presetBudgetConstrained();
                  setContext(manager.getContext());
                }}
              >
                📱 Budget (4GB RAM / Metered)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-[11px]"
                onClick={() => {
                  manager.presetOfflineLowBattery();
                  setContext(manager.getContext());
                }}
              >
                ⚠️ Offline Critical (14% Bat / Severe)
              </Button>
            </div>
          </div>

          {/* Available RAM Slider */}
          <div className="border-2 border-black p-3.5 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="flex justify-between items-center mb-1.5 font-bold">
              <span className="text-zinc-800 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Available RAM Headroom
              </span>
              <span className="text-cyan-800 text-sm font-black">
                {context.availableRamMb} MB / {context.totalRamMb} MB
              </span>
            </div>
            <input
              type="range"
              min="512"
              max="8192"
              step="128"
              value={context.availableRamMb}
              onChange={(e) => handleUpdate({ availableRamMb: Number(e.target.value) })}
              className="w-full accent-black cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>512 MB (OOM Risk)</span>
              <span>2048 MB (Mid-range)</span>
              <span>8192 MB (Flagship)</span>
            </div>
          </div>

          {/* Battery & Charging */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border-2 border-black p-3.5 bg-zinc-50 shadow-[2px_2px_0px_#000]">
              <div className="flex justify-between items-center mb-1.5 font-bold">
                <span className="text-zinc-800 uppercase flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5" /> Battery Reserve
                </span>
                <span className="text-sm font-black">{context.batteryPercentage}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={context.batteryPercentage}
                onChange={(e) => handleUpdate({ batteryPercentage: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
            </div>

            <div className="border-2 border-black p-3.5 bg-zinc-50 shadow-[2px_2px_0px_#000] flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                <input
                  type="checkbox"
                  checked={context.isCharging}
                  onChange={(e) => handleUpdate({ isCharging: e.target.checked })}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-zinc-900 uppercase">Device Plugged into Charger (AC)</span>
              </label>
              <div className="text-[10px] text-zinc-500 mt-1">
                Disables aggressive thermal power throttling.
              </div>
            </div>
          </div>

          {/* Thermal Status & Network State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="border-2 border-black p-3.5 bg-zinc-50 shadow-[2px_2px_0px_#000]">
              <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-1.5">
                Thermal Throttling State
              </label>
              <select
                value={context.thermalStatus}
                onChange={(e) => handleUpdate({ thermalStatus: e.target.value as ThermalStatus })}
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <option value="NOMINAL">NOMINAL (Cool)</option>
                <option value="MODERATE">MODERATE (Warm)</option>
                <option value="SEVERE">SEVERE (Throttled)</option>
                <option value="CRITICAL">CRITICAL (Emergency)</option>
              </select>
            </div>

            <div className="border-2 border-black p-3.5 bg-zinc-50 shadow-[2px_2px_0px_#000]">
              <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-1.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Network State
              </label>
              <select
                value={context.networkState}
                onChange={(e) => handleUpdate({ networkState: e.target.value as NetworkState })}
                className="w-full p-2 bg-white border-2 border-black font-mono text-xs font-bold shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <option value="WIFI_HIGH_SPEED">Wi-Fi 6 (High Speed)</option>
                <option value="CELLULAR_4G_5G">5G / 4G LTE</option>
                <option value="CELLULAR_METRED">Cellular Metered</option>
                <option value="OFFLINE">OFFLINE (Zero Network)</option>
              </select>
            </div>
          </div>

          {/* Cloud Policy Toggle */}
          <div className="border-2 border-black p-3 bg-zinc-50 shadow-[2px_2px_0px_#000] flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={context.allowCloudInference}
                onChange={(e) => handleUpdate({ allowCloudInference: e.target.checked })}
                className="w-4 h-4 accent-black"
              />
              <span className="uppercase text-xs">Allow Cloud Offload When Appropriate</span>
            </label>
            <Badge variant={context.allowCloudInference ? 'success' : 'dark'} className="text-[10px]">
              {context.allowCloudInference ? 'CLOUD ENABLED' : 'OFFLINE STRICT'}
            </Badge>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer p-4 border-t-2 border-black bg-zinc-100 flex justify-end gap-2">
          <Button variant="default" size="sm" onClick={onClose}>
            Apply & Close Simulator
          </Button>
        </div>
      </div>
    </div>
  );
};
