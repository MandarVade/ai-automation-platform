import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Code, Play, CheckCircle2, Copy } from 'lucide-react';
import { NLWorkflowPlanner, NLIntentAnalysis } from '../../core/workflow/nl-planner';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { Workflow } from '../../types/workflow';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

interface CreateScreenProps {
  initialPrompt?: string;
  onRunWorkflow: (wf: Workflow) => void;
  onEditInVisualBuilder: (wf: Workflow) => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({
  initialPrompt = 'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
  onRunWorkflow,
  onEditInVisualBuilder
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [analysis, setAnalysis] = useState<NLIntentAnalysis | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [copiedRoot, setCopiedRoot] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      const plan = NLWorkflowPlanner.planFromPrompt(initialPrompt);
      setAnalysis(plan);
    }
  }, [initialPrompt]);

  const handlePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      const plan = NLWorkflowPlanner.planFromPrompt(prompt.trim());
      setAnalysis(plan);
    }
  };

  const handleCopyProvenance = () => {
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 800);
  };

  const samplePrompts = [
    'Take a photo of my bill, extract items and prices, calculate total and categorize the expense.',
    'Record my lecture, transcribe it, summarize important concepts and generate 5 quiz questions.',
    'Take a photo of a plant, identify the disease, explain symptoms and create a botanical care plan.'
  ];

  return (
    <div className="w-full min-w-0 space-y-8 pb-12">
      {/* 1. Intent Specification Container: 28-32px padding, clear typography, distinct rows */}
      <section className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-7 sm:p-9 relative">
        {/* Top Decorative Tri-color Bar */}
        <div className="flex gap-2 mb-4">
          <div className="h-2 w-16 bg-rose-400 border border-black" />
          <div className="h-2 w-16 bg-[#FACC15] border border-black" />
          <div className="h-2 w-16 bg-[#A5F3FC] border border-black" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black font-mono uppercase tracking-tight text-black">
              AUTOMATION INTENT SPECIFICATION
            </h1>
            <Badge variant="cyber" className="text-xs px-2 py-0.5">
              AUTONOMOUS PLANNER
            </Badge>
          </div>
          <span className="text-xs font-mono text-zinc-600 font-bold hidden sm:inline">
            ZERO-CODE SYNTHESIS ENGINE
          </span>
        </div>

        <form onSubmit={handlePlan} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3.5">
            <input
              type="text"
              className="flex-1 p-4 border-2 border-black bg-white font-mono text-base font-semibold shadow-[2px_2px_0px_#000] placeholder:text-zinc-400 focus:shadow-[4px_4px_0px_#000] outline-none transition-shadow"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Record lecture, transcribe, extract concepts, summarize and create 5 quiz questions..."
            />
            <button
              type="submit"
              className="px-7 py-4 font-mono font-black text-sm uppercase border-2 border-black bg-[#FACC15] shadow-[3px_3px_0px_#000] hover:bg-amber-300 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>SYNTHESIZE WORKFLOW</span>
            </button>
          </div>
        </form>

        {/* Requirements Chips Row */}
        <div className="mt-5 pt-4 border-t-2 border-black flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider mr-1">
            EVIDENCE REQUIREMENTS:
          </span>
          {['Process activity', 'OCR extraction', 'Calculated sums', 'SQLite audit store'].map((req, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-white border-2 border-black font-mono font-bold text-xs shadow-[1px_1px_0px_#000]"
            >
              {req}
            </span>
          ))}
        </div>

        {/* Provenance Root & Copy Button */}
        <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-zinc-500 font-bold uppercase text-xs">PROVENANCE ROOT:</span>
            <span className="font-bold text-black text-xs">7b4c9e1208d4fa92837bc910aef531</span>
          </div>
          <button
            type="button"
            onClick={handleCopyProvenance}
            className="flex items-center gap-1.5 px-3 py-1 border border-black bg-white shadow-[1px_1px_0px_#000] hover:bg-zinc-100 text-xs font-mono font-bold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedRoot ? 'COPIED' : 'COPY'}</span>
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="mt-4 flex gap-2.5 flex-wrap items-center">
          <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
            SUGGESTED INTENTS:
          </span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              className="px-3 py-1.5 text-xs font-mono font-bold border border-black bg-zinc-50 shadow-[1px_1px_0px_#000] hover:bg-amber-100 cursor-pointer transition-colors"
              onClick={() => {
                setPrompt(p);
                const plan = NLWorkflowPlanner.planFromPrompt(p);
                setAnalysis(plan);
              }}
            >
              {idx === 0 ? '🧾 Bill & Expense' : idx === 1 ? '🎓 Lecture Notes & Quiz' : '🌿 Plant Care'}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Analysis & Generated Plan */}
      {analysis && (
        <div className="space-y-8">
          {/* Slot Extraction & Slot Metadata */}
          <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7">
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-black mb-5">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-black" />
                <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-black">
                  INTENT RECOGNITION & HARDWARE ROUTING PROFILE
                </h2>
              </div>
              <Badge variant="default" className="text-xs px-2.5 py-1">
                {analysis.detectedDomain} DOMAIN
              </Badge>
            </div>

            {/* 4-Card Slot Grid: min-height 100px, padding 16px, readable text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="border-2 border-black p-4 bg-zinc-50 shadow-[2px_2px_0px_#000] flex flex-col justify-between min-w-0 min-h-[100px]">
                <div className="text-xs font-mono font-bold text-zinc-600 uppercase tracking-wider">
                  DETECTED TRIGGER
                </div>
                <div className="text-base font-mono font-black text-black mt-2 truncate">
                  {analysis.extractedSlots.trigger}
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-cyan-50 shadow-[2px_2px_0px_#000] flex flex-col justify-between min-w-0 min-h-[100px]">
                <div className="text-xs font-mono font-bold text-cyan-900 uppercase tracking-wider">
                  AI CAPABILITIES
                </div>
                <div className="text-sm font-mono font-bold text-black mt-2 break-words">
                  {analysis.extractedSlots.aiCapabilities.join(', ')}
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-amber-50 shadow-[2px_2px_0px_#000] flex flex-col justify-between min-w-0 min-h-[100px]">
                <div className="text-xs font-mono font-bold text-amber-900 uppercase tracking-wider">
                  TRANSFORMS & MATH
                </div>
                <div className="text-sm font-mono font-bold text-black mt-2 break-words">
                  {analysis.extractedSlots.transforms.length
                    ? analysis.extractedSlots.transforms.join(', ')
                    : 'Deterministic verification'}
                </div>
              </div>

              <div className="border-2 border-black p-4 bg-emerald-50 shadow-[2px_2px_0px_#000] flex flex-col justify-between min-w-0 min-h-[100px]">
                <div className="text-xs font-mono font-bold text-emerald-900 uppercase tracking-wider">
                  ANDROID ACTIONS
                </div>
                <div className="text-sm font-mono font-bold text-black mt-2 break-words">
                  {analysis.extractedSlots.actions.join(', ')}
                </div>
              </div>
            </div>

            {/* Step-by-Step Reasoner Output */}
            <div className="border-2 border-black bg-zinc-900 p-5 font-mono text-sm space-y-2 shadow-[2px_2px_0px_#000]">
              <div className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-2">
                PLANNER LOGICAL REASONING TRACE:
              </div>
              {analysis.analysisSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    step.startsWith('✓') ? 'text-emerald-400 font-bold' : 'text-zinc-300'
                  }`}
                >
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Synthesized DAG Visualization Canvas */}
          <section className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black mb-5">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base sm:text-lg font-mono font-black uppercase text-black">
                  ADAPTIVE EXECUTION DECISION GRAPH
                </h2>
                <span className="px-2.5 py-0.5 bg-[#00D8F6] text-black font-mono font-black text-xs uppercase border border-black shadow-[1px_1px_0px_#000]">
                  DAG CANVAS
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-mono text-zinc-500 font-bold hidden sm:inline mr-2">
                  Click any node to inspect execution metadata
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowJson(!showJson)}
                  className="text-xs px-3.5 py-2"
                >
                  <Code className="w-4 h-4" />
                  <span>{showJson ? 'Hide JSON' : '{ } View JSON'}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEditInVisualBuilder(analysis.generatedWorkflow)}
                  className="text-xs px-3.5 py-2"
                >
                  <span>Edit in Canvas</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onRunWorkflow(analysis.generatedWorkflow)}
                  className="text-xs px-4 py-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Execute Pipeline</span>
                </Button>
              </div>
            </div>

            {/* Visual DAG Canvas */}
            <DAGVisualizer workflow={analysis.generatedWorkflow} />

            {/* DAG Footer */}
            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center justify-between text-xs font-mono text-zinc-600">
              <span>Tip: Click on Intent, Trigger, Transform, or Action nodes to inspect exact parameters.</span>
              <span className="font-bold text-black uppercase tracking-wider">GRAPH ACTIVE</span>
            </div>

            {/* Structured JSON Schema Drawer */}
            {showJson && (
              <div className="mt-5 border-2 border-black p-5 bg-zinc-900 shadow-[3px_3px_0px_#000]">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase mb-3">
                  STRUCTURED WORKFLOW JSON SPECIFICATION:
                </div>
                <pre className="code-view max-h-96 overflow-y-auto text-xs leading-relaxed">
                  {JSON.stringify(analysis.generatedWorkflow, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
