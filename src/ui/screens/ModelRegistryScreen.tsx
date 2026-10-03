import React, { useState } from 'react';
import { ModelRegistry } from '../../core/model/registry';
import { ModelSpec } from '../../types/model';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { StatusPill } from '../components/StatusPill';
import { Search, Cpu, Cloud, CheckCircle2, Sliders, Info, Zap } from 'lucide-react';

export const ModelRegistryScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCap, setSelectedCap] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'LOCAL' | 'CLOUD'>('ALL');
  const [inspectModel, setInspectModel] = useState<ModelSpec | null>(null);

  const allModels = ModelRegistry.getAll();

  const filtered = allModels.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCap = selectedCap === 'ALL' || m.capability === selectedCap;
    const matchesType =
      filterType === 'ALL'
        ? true
        : filterType === 'LOCAL'
        ? m.isLocalAvailable
        : m.isCloudAvailable;
    return matchesSearch && matchesCap && matchesType;
  });

  const capabilities = [
    'ALL',
    'OCR',
    'SPEECH_TO_TEXT',
    'SUMMARIZATION',
    'CONCEPT_EXTRACTION',
    'QUESTION_GENERATION',
    'EXPENSE_CATEGORIZATION',
    'PLANT_DISEASE_DIAGNOSIS',
    'TASK_EXTRACTION'
  ];

  return (
    <div className="space-y-6">
      {/* 1. Top Header Specification */}
      <section className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-black">
                ON-DEVICE & CLOUD MODEL REGISTRY
              </span>
              <Badge variant="cyber" className="text-[10px]">
                5 ACTIVE TIERS
              </Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase mt-1">
              AI MODEL REGISTRY & HARDWARE PROFILES
            </h1>
            <p className="text-xs font-mono text-zinc-600 mt-0.5">
              Curated on-device NPU/CPU and cloud AI model specifications, quantization tiers, and execution delegates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill label="REAL: TESSERACT WASM" status="real" />
            <StatusPill label="METADATA: TFLITE / CLOUD" status="metadata" />
          </div>
        </div>
      </section>

      {/* 2. Filters & Discovery Bar */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              className="w-full pl-9 pr-3 py-1.5 bg-white border-2 border-black font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] outline-none"
              placeholder="Search models by name or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedCap}
            onChange={(e) => setSelectedCap(e.target.value)}
            className="px-3 py-1.5 bg-white border-2 border-black font-mono text-xs font-bold text-black shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
          >
            {capabilities.map((c) => (
              <option key={c} value={c}>
                Capability: {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-black transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-black text-amber-300 shadow-[2px_2px_0px_#FACC15]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
              }`}
              onClick={() => setFilterType('ALL')}
            >
              All Models ({allModels.length})
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-black transition-all cursor-pointer ${
                filterType === 'LOCAL'
                  ? 'bg-black text-cyan-300 shadow-[2px_2px_0px_#00F0FF]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
              }`}
              onClick={() => setFilterType('LOCAL')}
            >
              On-Device Only
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-black transition-all cursor-pointer ${
                filterType === 'CLOUD'
                  ? 'bg-black text-purple-300 shadow-[2px_2px_0px_#C084FC]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-[2px_2px_0px_#000]'
              }`}
              onClick={() => setFilterType('CLOUD')}
            >
              Cloud Only
            </button>
          </div>
        </div>
      </section>

      {/* 3. Models Grid */}
      <div className="card-grid">
        {filtered.map((model) => {
          const isRealRuntime = model.id === 'model_tesseract_wasm' || model.name.includes('Tesseract');

          return (
            <div key={model.id} className="workflow-card">
              <div>
                <div className="card-top">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase border-2 border-black shadow-[1px_1px_0px_#000] ${
                        model.isLocalAvailable ? 'bg-cyan-200 text-black' : 'bg-purple-200 text-black'
                      }`}
                    >
                      {model.isLocalAvailable ? 'ON-DEVICE' : 'CLOUD ENDPOINT'}
                    </span>

                    {isRealRuntime ? (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-black uppercase border border-black bg-emerald-300 text-black">
                        REAL RUNTIME
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border border-black bg-zinc-100 text-zinc-600">
                        METADATA ONLY
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono font-bold text-zinc-500">
                    {model.quantization}
                  </span>
                </div>

                <div className="card-name">{model.name}</div>
                <div className="text-xs font-mono font-bold text-cyan-800 uppercase mb-2">
                  {model.capability}
                </div>
                <div className="card-desc">{model.description}</div>
              </div>

              <div>
                {/* 3-Cell Specs Grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-zinc-50 border-2 border-black font-mono text-[10px] shadow-[2px_2px_0px_#000] mb-3">
                  <div>
                    <span className="text-zinc-500 block uppercase font-bold">RAM:</span>
                    <span className="font-black text-black">{model.ramRequirementMb} MB</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase font-bold">LATENCY:</span>
                    <span className="font-black text-black">~{model.expectedLatencyMs}ms</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block uppercase font-bold">QUALITY:</span>
                    <span className="font-black text-emerald-700">
                      {Math.round(model.qualityScore * 100)}%
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <div className="text-[10px] font-mono text-zinc-600 font-bold truncate max-w-[170px]">
                    HW: {model.supportedDelegates.join(', ')}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] py-1"
                    onClick={() => setInspectModel(model)}
                  >
                    Inspect Spec
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Spec Inspection Dialog */}
      {inspectModel && (
        <div className="modal-backdrop" onClick={() => setInspectModel(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="text-[10px] font-mono font-bold text-black uppercase">
                  MODEL ARCHITECTURE & SPECIFICATION
                </span>
                <h3 className="text-base font-black font-mono uppercase text-black">
                  {inspectModel.name}
                </h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setInspectModel(null)}>
                ✕
              </Button>
            </div>
            <div className="modal-body p-4 bg-zinc-50">
              <pre className="code-view max-h-96">
                {JSON.stringify(inspectModel, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <Button variant="default" size="sm" onClick={() => setInspectModel(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
