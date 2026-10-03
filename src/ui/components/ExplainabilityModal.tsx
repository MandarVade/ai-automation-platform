import React from 'react';
import { ModelScoreBreakdown } from '../../types/model';
import { Button } from './Button';
import { Badge } from './Badge';
import { Check, X, Cpu } from 'lucide-react';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown?: ModelScoreBreakdown;
  allCandidates?: ModelScoreBreakdown[];
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  allCandidates = []
}) => {
  if (!isOpen || !breakdown) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog max-w-2xl border-3 border-black bg-white shadow-[6px_6px_0px_#000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header bg-amber-400 border-b-2 border-black p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-black uppercase text-black">
              AUTONOMOUS MODEL SELECTION RATIONALE
            </span>
            <h3 className="text-base font-black font-mono uppercase text-black">
              Why {breakdown.modelName}?
            </h3>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="p-1 h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="modal-body p-5 space-y-4 font-mono text-xs">
          {/* Winner Overview Card */}
          <div className="border-2 border-black bg-zinc-50 p-4 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-2 border-b border-black mb-3">
              <div className="flex items-center gap-2">
                <Badge variant={breakdown.location === 'CLOUD' ? 'purple' : 'cyber'} className="text-[10px]">
                  {breakdown.location}
                </Badge>
                <span className="font-black text-sm uppercase text-black">Selected Model</span>
              </div>
              <div className="text-base font-black font-mono text-emerald-700">
                Score: {breakdown.totalScore} / 100
              </div>
            </div>

            <div className="space-y-1.5">
              {breakdown.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-zinc-800 font-semibold">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring Factors Breakdown Grid */}
          <div>
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase mb-2">
              MULTI-FACTOR EVALUATION SCORE MATRIX:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Capability Fit</div>
                <div className="text-sm font-black mt-0.5">{breakdown.capabilityFit}%</div>
              </div>
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Model Quality</div>
                <div className="text-sm font-black mt-0.5">{breakdown.accuracyScore}%</div>
              </div>
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Latency Fit</div>
                <div className="text-sm font-black mt-0.5">{breakdown.latencyScore}%</div>
              </div>
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Hardware Fit</div>
                <div className="text-sm font-black mt-0.5">{breakdown.hardwareFitScore}%</div>
              </div>
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Battery Profile</div>
                <div className="text-sm font-black mt-0.5">{breakdown.batteryFitScore}%</div>
              </div>
              <div className="border border-black p-2.5 bg-zinc-50 shadow-[1px_1px_0px_#000]">
                <div className="text-[9px] text-zinc-500 uppercase font-bold">Memory Headroom</div>
                <div className="text-sm font-black mt-0.5">{breakdown.memoryFitScore}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer p-4 border-t-2 border-black bg-zinc-100 flex justify-end">
          <Button variant="default" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
