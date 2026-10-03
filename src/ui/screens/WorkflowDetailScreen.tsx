import React from 'react';
import { Workflow } from '../../types/workflow';
import { DAGVisualizer } from '../components/DAGVisualizer';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { ArrowLeft, Play, Edit3, Layers } from 'lucide-react';

interface WorkflowDetailScreenProps {
  workflow: Workflow;
  onEdit: (wf: Workflow) => void;
  onRun: (wf: Workflow) => void;
  onBack: () => void;
}

export const WorkflowDetailScreen: React.FC<WorkflowDetailScreenProps> = ({
  workflow,
  onEdit,
  onRun,
  onBack
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <section className="border-3 border-black bg-white shadow-[4px_4px_0px_#000] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="mb-3 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Library</span>
            </Button>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="default" className="text-xs">
                {workflow.domain}
              </Badge>
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-black uppercase">
                {workflow.name}
              </h1>
            </div>
            <p className="text-xs sm:text-sm font-sans font-medium text-zinc-700 mt-1 max-w-3xl">
              {workflow.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => onEdit(workflow)}>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit in Canvas</span>
            </Button>
            <Button variant="default" size="sm" onClick={() => onRun(workflow)}>
              <Play className="w-3.5 h-3.5" />
              <span>Execute Automation</span>
            </Button>
          </div>
        </div>
      </section>

      {/* DAG Graph Canvas */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black uppercase text-black">
              DAG EXECUTION PIPELINE GRAPH
            </span>
            <Badge variant="cyber" className="text-[10px]">
              {workflow.nodes.length} NODES
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-zinc-600 font-bold hidden sm:inline">
            Deterministic DAG Flow
          </span>
        </div>
        <DAGVisualizer workflow={workflow} />
      </section>

      {/* Detailed Node Pipeline List */}
      <section className="border-2 border-black bg-white shadow-[4px_4px_0px_#000] p-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-black mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-black" />
            <span className="text-xs font-mono font-black uppercase text-black">
              STRUCTURED EXECUTION PIPELINE ({workflow.nodes.length} NODES)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-600 font-bold">
            Target Execution Order
          </span>
        </div>

        <div className="space-y-3">
          {workflow.nodes.map((node, i) => (
            <div
              key={node.id}
              className="flex items-center justify-between p-3.5 border-2 border-black bg-zinc-50 shadow-[2px_2px_0px_#000] text-xs font-mono"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-zinc-500 w-5">
                  0{i + 1}.
                </span>
                <div>
                  <div className="font-black text-sm text-black uppercase">{node.label}</div>
                  <div className="text-[11px] text-zinc-600 font-medium">
                    Type: <strong className="text-black">{node.type}</strong> | Capability:{' '}
                    <strong className="text-cyan-800">{node.capability}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 border border-black bg-white font-bold text-[10px]">
                  POLICY: {node.executionPolicy}
                </span>
                <span className="px-2 py-0.5 border border-black bg-amber-200 text-black font-bold text-[10px]">
                  {node.outputType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
