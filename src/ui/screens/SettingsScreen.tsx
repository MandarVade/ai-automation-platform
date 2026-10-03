import React, { useState } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { IntermediateResultCache } from '../../core/cache/result-cache';
import { ModelLifecycleManager } from '../../core/model/lifecycle';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Shield, Zap, Cpu, Trash2, Smartphone, Terminal, Server } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const deviceMgr = DeviceContextManager.getInstance();
  const cache = IntermediateResultCache.getInstance();
  const lifecycle = ModelLifecycleManager.getInstance();

  const [device, setDevice] = useState(deviceMgr.getContext());
  const [cacheStats, setCacheStats] = useState(cache.getStats());

  const handleToggleCloud = (allowed: boolean) => {
    deviceMgr.updateContext({ allowCloudInference: allowed });
    setDevice(deviceMgr.getContext());
  };

  const handleClearCache = () => {
    cache.clear();
    setCacheStats(cache.getStats());
  };

  const handleUnloadAllModels = () => {
    lifecycle.unloadAll();
    alert('All AI models unloaded from Android RAM.');
  };

  return (
    <div className="w-full min-w-0 space-y-8 pb-12">
      {/* 1. Page Header Specification */}
      <section className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-black">
            PLATFORM CONFIGURATION & RUNTIME POLICIES
          </span>
          <Badge variant="default" className="text-xs px-2 py-0.5">
            ACTIVE CONTEXT
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-black uppercase mt-1">
          SYSTEM SETTINGS & PRIVACY BOUNDARIES
        </h1>
        <p className="text-sm font-sans font-medium text-zinc-600 mt-1 max-w-3xl leading-relaxed">
          Configure on-device resource constraints, zero-cloud data privacy boundaries, intermediate cache persistence, and model lifecycle delegates.
        </p>
      </section>

      {/* 2. DEVICE / RUNTIME PANEL */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <Smartphone className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase text-black">
            DEVICE HARDWARE & RUNTIME TARGET
          </h2>
        </div>
        <p className="text-sm font-sans text-zinc-700 font-medium leading-relaxed">
          Target hardware profiling for on-device AI model dispatch, memory budgeting, and NNAPI hardware acceleration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">HARDWARE MODEL</div>
            <div className="text-base font-mono font-black text-black mt-1">{device.deviceModel}</div>
          </div>
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">ANDROID OS VERSION</div>
            <div className="text-base font-mono font-black text-black mt-1">API {device.androidVersion}</div>
          </div>
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">TOTAL / AVAILABLE RAM</div>
            <div className="text-base font-mono font-black text-black mt-1">{device.availableRamMb} / {device.totalRamMb} MB</div>
          </div>
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">NPU ACCELERATOR</div>
            <div className="text-base font-mono font-black text-emerald-700 mt-1">{device.hasNpu ? 'NNAPI NPU DETECTED' : 'CPU FALLBACK'}</div>
          </div>
        </div>
      </section>

      {/* 3. MODEL POLICY & MEMORY ALLOCATION */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <Cpu className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase text-black">
            MODEL POLICY & MEMORY ALLOCATION
          </h2>
        </div>
        <p className="text-sm font-sans text-zinc-700 font-medium leading-relaxed">
          Active AI models loaded into Android process memory: <strong>{lifecycle.getLoadedModels().length}</strong> models (
          <strong>{lifecycle.getTotalActiveRamMb()} MB</strong> active allocation).
        </p>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleUnloadAllModels} className="text-xs px-4 py-2">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Unload All Models from RAM</span>
          </Button>
        </div>
      </section>

      {/* 4. CACHE PERSISTENCE */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <Zap className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase text-black">
            DETERMINISTIC INTERMEDIATE RESULT CACHE
          </h2>
        </div>
        <p className="text-xs font-mono text-zinc-600">
          Key format: <code>workflowId::nodeId::inputHash::modelVersion::parameters</code>
        </p>

        {/* Cache Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">CACHED ENTRIES</div>
            <div className="text-2xl font-mono font-black text-black mt-1">{cacheStats.size}</div>
          </div>
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">CACHE HITS</div>
            <div className="text-2xl font-mono font-black text-emerald-700 mt-1">{cacheStats.hits}</div>
          </div>
          <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000]">
            <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">HIT RATIO</div>
            <div className="text-2xl font-mono font-black text-cyan-800 mt-1">{cacheStats.hitRatioPercent}%</div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={handleClearCache} className="text-xs px-4 py-2">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Cache Entries</span>
          </Button>
        </div>
      </section>

      {/* 5. PRIVACY & ZERO-CLOUD BOUNDARY */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <Shield className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase text-black">
            DATA PRIVACY & ZERO-CLOUD BOUNDARY
          </h2>
        </div>
        <p className="text-sm font-sans text-zinc-700 font-medium leading-relaxed">
          Enforce local-first execution. When cloud offloading is disabled, all microphone, camera, and document data remains strictly in Android device memory.
        </p>

        <div className="border-2 border-black p-4 bg-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[2px_2px_0px_#000]">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={device.allowCloudInference}
              onChange={(e) => handleToggleCloud(e.target.checked)}
              className="w-5 h-5 accent-black border-2 border-black"
            />
            <span className="font-mono text-sm font-bold text-black uppercase">
              Enable Hybrid Cloud Offloading
            </span>
          </label>
          <Badge variant={device.allowCloudInference ? 'success' : 'dark'} className="text-xs px-2.5 py-1 self-start sm:self-auto">
            {device.allowCloudInference ? 'CLOUD PERMITTED' : 'STRICT LOCAL ONLY'}
          </Badge>
        </div>
      </section>

      {/* 6. SYSTEM INFORMATION */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <Server className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase text-black">
            SYSTEM & PROVENANCE LEDGER ENGINE
          </h2>
        </div>
        <p className="text-sm font-sans text-zinc-700 font-medium leading-relaxed">
          Underlying cryptographic engine: SQLite on Android, WebAssembly on local browser runtime, and SHA-256 state hashing.
        </p>
        <div className="font-mono text-xs text-zinc-600 bg-zinc-100 p-3 border border-black">
          <div>ENGINE VERSION: EL-06 AUTONOMOUS v1.0.0-PROD</div>
          <div>HASH ALGORITHM: SHA-256 DIGEST DETERMINISTIC MERKLE LEAF</div>
          <div>DATABASE DRIVER: ANDROID SQLITE 3.42 / IN-MEMORY FALLBACK</div>
        </div>
      </section>
    </div>
  );
};
