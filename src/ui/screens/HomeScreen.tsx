import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Shield,
  Activity,
  Database,
  RefreshCw,
  Plus,
  Copy,
  Folder,
  Server,
  Box,
  BatteryCharging,
  Battery,
  FileText,
  MessageSquareCode,
  GraduationCap,
  Leaf,
  GitFork,
  Settings
} from 'lucide-react';
import { Workflow } from '../../types/workflow';
import { DeviceContext } from '../../types/device';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { ExecutionHistoryStore } from '../../data/history-store';
import { IntermediateResultCache } from '../../core/cache/result-cache';
import { EL06Emblem } from '../components/EL06Logo';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { NavTab } from '../components/BottomNav';

interface HomeScreenProps {
  device: DeviceContext;
  onSelectWorkflow: (wf: Workflow) => void;
  onRunWorkflow: (wf: Workflow) => void;
  onStartNLPlan: (prompt: string) => void;
  onOpenVisualBuilder: () => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  device,
  onSelectWorkflow,
  onRunWorkflow,
  onStartNLPlan,
  onOpenVisualBuilder,
  onNavigateTab
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('wf_finance_bill');
  const [completedRuns, setCompletedRuns] = useState<number>(0);
  const [cacheHits, setCacheHits] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const history = ExecutionHistoryStore.getInstance().getAll();
    setCompletedRuns(history.length);
    const cacheStats = IntermediateResultCache.getInstance().getStats();
    setCacheHits(cacheStats.hits);
  }, []);

  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    const history = ExecutionHistoryStore.getInstance().getAll();
    setCompletedRuns(history.length);
    const cacheStats = IntermediateResultCache.getInstance().getStats();
    setCacheHits(cacheStats.hits);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onStartNLPlan(prompt.trim());
    }
  };

  const handleCopyId = () => {
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 800);
  };

  const samplePrompts = [
    'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
    'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.',
    'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.'
  ];

  const activePipeline = DEMO_WORKFLOWS.find((w) => w.id === selectedPipelineId) || DEMO_WORKFLOWS[0];

  return (
    <div className="w-full min-w-0 space-y-6 pb-12">
      {/* 1. TOP COMMAND PANEL matching Reference Screenshot */}
      <section className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7 relative overflow-hidden">
        {/* Top-Right Decorative Yellow Triangle Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
          <svg className="absolute top-0 right-0 w-24 h-24 pointer-events-none" viewBox="0 0 96 96">
            <polygon points="0,0 96,0 96,96" fill="#FACC15" />
            <line x1="0" y1="0" x2="96" y2="96" stroke="black" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Row 1: Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="px-2.5 py-0.5 bg-black text-[#FACC15] border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#000]">
            EL-06 AUTONOMOUS v1.0
          </div>
          <div className="px-2.5 py-0.5 bg-[#A5F3FC] text-black border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#000]">
            COMMAND POSTURE: ACTIVE
          </div>
          <div className="px-2.5 py-0.5 bg-[#A5F3FC] text-black border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#000]">
            SIMULATION MODE ACTIVE
          </div>
        </div>

        {/* Row 2: Title and Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FACC15] border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center shrink-0">
              <EL06Emblem size={44} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-black uppercase leading-tight">
                EL-06 AUTOMATION COMMAND
              </h1>
              <p className="text-xs sm:text-sm font-sans font-semibold text-zinc-700 mt-1 max-w-3xl leading-snug">
                Cross-platform Android automation, adaptive execution, OCR intelligence, and zero-code workflow orchestration.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRefreshTelemetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-zinc-50 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>REFRESH TELEMETRY</span>
            </button>
            <button
              type="button"
              onClick={() => onStartNLPlan(samplePrompts[0])}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-black border-2 border-black bg-[#FACC15] shadow-[3px_3px_0px_#000] hover:bg-amber-300 active:translate-y-0.5 active:shadow-none cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ NEW WORKFLOW</span>
            </button>
          </div>
        </div>

        {/* Row 3: Operational Subsystems Bar */}
        <div className="pt-3 mt-3 border-t-2 border-black flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider mr-1">
            OPERATIONAL SUBSYSTEMS:
          </span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#A7F3D0] text-black border-2 border-black text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>AI ENGINE: ONLINE</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#BAE6FD] text-black border-2 border-black text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span>OCR WASM: VERIFIED</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#A7F3D0] text-black border-2 border-black text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>RESULT CACHE: ACTIVE</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#E9D5FF] text-black border-2 border-black text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
            <span>NPU DELEGATE: ONLINE</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FFEDD5] text-black border-2 border-black text-[11px] font-bold uppercase shadow-[1px_1px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
            <span>ANDROID ACTIONS: READY</span>
          </div>
        </div>

        {/* Row 4: Exactly 6 Navigation Buttons matching reference */}
        <div className="pt-3 mt-3 border-t border-zinc-200 flex flex-wrap gap-2">
          {[
            { label: 'WORKFLOWS', tab: 'workflows' as NavTab, active: true },
            { label: 'BUILDER', tab: 'builder' as NavTab },
            { label: 'EXECUTION', tab: 'home' as NavTab, action: () => onRunWorkflow(activePipeline) },
            { label: 'MODELS', tab: 'models' as NavTab },
            { label: 'ACTIVITY', tab: 'activity' as NavTab },
            { label: 'SETTINGS', tab: 'settings' as NavTab }
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (onNavigateTab) {
                  onNavigateTab(item.tab);
                }
              }}
              className={`flex-1 min-w-[120px] py-2 px-3 border-2 border-black font-mono font-bold text-xs uppercase transition-all cursor-pointer text-center ${
                item.active
                  ? 'bg-[#FACC15] text-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {/* 2. ACTIVE AUTOMATION CONTEXT matching Reference Screenshot */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-black mb-3">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-black shrink-0">
              <MessageSquareCode className="w-4 h-4 text-black" />
              <span>ACTIVE AUTOMATION CONTEXT</span>
            </div>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="px-3 py-1 bg-[#FACC15] text-black border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_#000] outline-none cursor-pointer"
            >
              <option value="wf_finance_bill">
                WF_FINANCE_BILL — SMART BILL & EXPENSE PROCESSOR
              </option>
              {DEMO_WORKFLOWS.filter((w) => w.id !== 'wf_finance_bill').map((w) => (
                <option key={w.id} value={w.id}>
                  {w.id.toUpperCase()} — {w.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Nav Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectWorkflow(activePipeline)}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-zinc-50 active:translate-y-0.5 cursor-pointer"
            >
              Overview →
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateTab) onNavigateTab('create');
              }}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-[#FACC15] shadow-[2px_2px_0px_#000] hover:bg-amber-300 active:translate-y-0.5 cursor-pointer"
            >
              Adaptive →
            </button>
            <button
              type="button"
              onClick={onOpenVisualBuilder}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-[#A5F3FC] shadow-[2px_2px_0px_#000] hover:bg-cyan-200 active:translate-y-0.5 cursor-pointer"
            >
              Visual Builder →
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateTab) onNavigateTab('models');
              }}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-[#E9D5FF] shadow-[2px_2px_0px_#000] hover:bg-purple-200 active:translate-y-0.5 cursor-pointer"
            >
              Models →
            </button>
            <button
              type="button"
              id="execute-now-btn"
              onClick={() => onRunWorkflow(activePipeline)}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-[#FED7AA] shadow-[2px_2px_0px_#000] hover:bg-orange-200 active:translate-y-0.5 cursor-pointer"
            >
              Execute →
            </button>
          </div>
        </div>

        {/* 6-Cell Continuous Information Matrix with vertical dividers */}
        <div className="border-2 border-black bg-white shadow-[2px_2px_0px_#000] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 lg:divide-x-2 divide-black text-xs font-mono">
          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
              <span>CASE / WORKFLOW ID</span>
              <button type="button" onClick={handleCopyId} className="cursor-pointer">
                <Copy className="w-3 h-3 text-zinc-500" />
              </button>
            </div>
            <div className="font-bold text-black truncate mt-1 text-xs">
              {copiedId ? 'COPIED!' : activePipeline.id}
            </div>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">TITLE</div>
            <div className="font-bold text-black truncate mt-1 text-xs font-sans">
              Smart Bill & Expense Processor
            </div>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">STATUS / SEVERITY</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="px-1.5 py-0.2 bg-white text-black font-bold text-[10px] border border-black">
                IN_PROGRESS
              </span>
              <span className="px-1.5 py-0.2 bg-[#EF4444] text-white font-bold text-[10px] border border-black">
                CRITICAL
              </span>
            </div>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">TARGET DEVICE</div>
            <div className="font-bold text-black truncate mt-1 text-xs font-sans">
              Pixel 8 Pro (Local CPU)
            </div>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">EVIDENCE BOUND</div>
            <div className="font-bold text-black truncate mt-1 text-xs font-sans">
              1 Receipt Image
            </div>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between">
            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">ADAPTIVE PROFILES</div>
            <div className="font-bold text-purple-700 truncate mt-1 text-xs">
              3 Execution Tiers
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRIC CARDS (8 Cards in 4 columns x 2 rows with left and right icons) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-black" />
              <span>ACTIVE CASES</span>
            </div>
            <GitFork className="w-3.5 h-3.5 text-black" />
          </div>
          <div className="text-3xl font-mono font-black text-black my-1">2</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">In triage / execution</div>
        </div>

        {/* Card 2 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>COMPLETED RUNS</span>
            </div>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-600 my-1">{completedRuns || 1}</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">Sealed & audit logged</div>
        </div>

        {/* Card 3 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-700" />
              <span>EXECUTION DELEGATES</span>
            </div>
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-3xl font-mono font-black text-black my-1">5</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">Local WASM + NNAPI NPU</div>
        </div>

        {/* Card 4 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>CACHE HITS</span>
            </div>
            <Zap className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-3xl font-mono font-black text-black my-1">{cacheHits || 5}</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">Deterministic intermediate hit</div>
        </div>

        {/* Card 5 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-cyan-700" />
              <span>MEMORY INTEGRITY</span>
            </div>
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-600 my-1">100%</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">SHA-256 verified runtime</div>
        </div>

        {/* Card 6 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-rose-600" />
              <span>MODEL TIERS</span>
            </div>
            <Activity className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-3xl font-mono font-black text-black my-1">5</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">TFLite & Tesseract WASM</div>
        </div>

        {/* Card 7 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
              <span>BATTERY NOMINAL</span>
            </div>
            <Battery className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-3xl font-mono font-black text-emerald-600 my-1">100%</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">Charging</div>
        </div>

        {/* Card 8 */}
        <div className="border-2 border-black bg-white p-3.5 shadow-[3px_3px_0px_#000] flex flex-col justify-between min-w-0 h-[106px]">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-zinc-600 uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>AUDIT PROVENANCE</span>
            </div>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-black my-1">#1045</div>
          <div className="text-[11px] font-mono text-zinc-600 truncate">SQLite cryptographic ledger</div>
        </div>
      </section>

      {/* 4. ADAPTIVE EXECUTION INTELLIGENCE (CORE USP) matching Reference Screenshot */}
      <section className="border-[3px] border-black bg-[#00D8F6] p-5 sm:p-6 shadow-[4px_4px_0px_#000]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 bg-[#00D8F6] border-2 border-black flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-mono tracking-tight text-black uppercase">
                  ADAPTIVE EXECUTION INTELLIGENCE (CORE USP)
                </h2>
                <span className="px-2 py-0.5 bg-black text-[#00D8F6] font-mono font-black text-[10px] uppercase border border-black shadow-[1px_1px_0px_#000]">
                  ZERO RECOMPILATION
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans font-semibold text-black mt-0.5">
                One Natural Language Intent dynamically dispatches tailored execution profiles per endpoint architecture and hardware constraints.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVisualBuilder}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-black border-2 border-black bg-[#FACC15] shadow-[2px_2px_0px_#000] hover:bg-amber-300 active:translate-y-0.5 active:shadow-none cursor-pointer shrink-0 transition-all"
          >
            <span>OPEN VISUAL BUILDER</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Stage Pipeline matching reference */}
        <div className="pt-3 border-t-2 border-black flex items-center flex-wrap gap-2 text-xs font-mono font-black text-black">
          <div className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            1. USER INTENT
          </div>
          <span className="text-black font-black text-sm">→</span>
          <div className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            2. WORKFLOW PLANNER
          </div>
          <span className="text-black font-black text-sm">→</span>
          <div className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            3. MODEL SELECTION
          </div>
          <span className="text-black font-black text-sm">→</span>
          <div className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            4. RESOURCE ROUTER
          </div>
          <span className="text-black font-black text-sm">→</span>
          <div className="px-3 py-1.5 bg-[#FACC15] border-2 border-black shadow-[2px_2px_0px_#000] uppercase">
            5. REAL EXECUTION
          </div>
        </div>
      </section>

      {/* 5. WHAT DO YOU WANT TO AUTOMATE? matching Reference Screenshot */}
      <section className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquareCode className="w-5 h-5 text-black" />
          <h2 className="text-base sm:text-lg font-black font-mono uppercase tracking-tight text-black">
            WHAT DO YOU WANT TO AUTOMATE?
          </h2>
        </div>
        <p className="text-xs sm:text-sm font-sans font-medium text-zinc-700 mb-4 max-w-3xl leading-relaxed">
          Describe your multi-step AI automation in plain English. The platform determines capabilities, models, routing, and device orchestration.
        </p>

        {/* Input Form with Right Plan Button */}
        <form onSubmit={handleGenerate}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="flex-1 p-3.5 border-2 border-black bg-white font-mono text-xs sm:text-sm font-semibold shadow-[2px_2px_0px_#000] placeholder:text-zinc-400 placeholder:italic focus:shadow-[3px_3px_0px_#000] outline-none transition-shadow"
              placeholder="e.g. Take a photo of my bill, extract items and prices, calculate total and categorize the expense..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              type="submit"
              className="px-5 py-3.5 bg-[#FACC15] border-2 border-black font-mono font-black text-xs uppercase shadow-[2px_2px_0px_#000] hover:bg-amber-300 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>PLAN WORKFLOW →</span>
            </button>
          </div>
        </form>

        {/* Example Chips Row matching reference */}
        <div className="mt-4 pt-3 border-t border-zinc-200 flex gap-2 flex-wrap items-center">
          <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mr-1">
            EXAMPLES:
          </span>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer transition-all"
            onClick={() => onStartNLPlan(samplePrompts[0])}
          >
            <FileText className="w-3.5 h-3.5 text-black" />
            <span>BILL & EXPENSE</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer transition-all"
            onClick={() => onStartNLPlan(samplePrompts[1])}
          >
            <GraduationCap className="w-3.5 h-3.5 text-black" />
            <span>LECTURE NOTES & QUIZ</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer transition-all"
            onClick={() => onStartNLPlan(samplePrompts[2])}
          >
            <Leaf className="w-3.5 h-3.5 text-black" />
            <span>PLANT CARE</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer transition-all"
            onClick={onOpenVisualBuilder}
          >
            <span>+ OPEN VISUAL CANVAS</span>
          </button>
        </div>
      </section>

      {/* 6. VERIFIED AI AUTOMATION PIPELINES matching Reference Screenshot Header */}
      <section className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-black" />
            <h2 className="text-base sm:text-lg font-black font-mono uppercase tracking-tight text-black">
              VERIFIED AI AUTOMATION PIPELINES
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-black text-[#FACC15] font-mono font-bold text-xs uppercase border border-black shadow-[1px_1px_0px_#000]">
              4 BUILT-IN TEMPLATES
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('workflows')}
              className="px-3 py-1 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-zinc-100 cursor-pointer"
            >
              VIEW ALL →
            </button>
          </div>
        </div>

        {/* 3 Pipeline Cards in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEMO_WORKFLOWS.map((wf) => (
            <div
              key={wf.id}
              className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-5 flex flex-col justify-between gap-4 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-xs font-mono font-black uppercase border border-black shadow-[1px_1px_0px_#000] ${
                    wf.domain === 'FINANCE' ? 'bg-emerald-300 text-black' :
                    wf.domain === 'EDUCATION' ? 'bg-blue-300 text-black' :
                    'bg-amber-300 text-black'
                  }`}>
                    {wf.domain}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    v{wf.version} · {wf.nodes.length} STEPS
                  </span>
                </div>

                <div className="text-base font-black font-mono uppercase text-black mt-2 mb-1.5">
                  {wf.name}
                </div>
                <div className="text-xs font-sans font-medium text-zinc-700 leading-relaxed">
                  {wf.description}
                </div>
              </div>

              <div>
                {/* Pipeline Node Flow Preview */}
                <div className="flex items-center flex-wrap gap-1 p-2.5 bg-zinc-50 border border-black mb-4 font-mono text-[11px] font-bold text-black">
                  {wf.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <span className="px-1.5 py-0.5 bg-white border border-black text-[11px] font-bold">
                        {node.label}
                      </span>
                      {i < wf.nodes.length - 1 && <span className="font-black">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2.5 pt-3 border-t-2 border-black">
                  <Button variant="outline" size="sm" onClick={() => onSelectWorkflow(wf)} className="text-xs px-3 py-1.5">
                    Inspect DAG
                  </Button>
                  <Button variant="default" size="sm" onClick={() => onRunWorkflow(wf)} className="text-xs px-3 py-1.5">
                    ▶ Execute Pipeline
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
