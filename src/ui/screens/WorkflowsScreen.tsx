import React, { useState, useEffect, useMemo } from 'react';
import { Workflow } from '../../types/workflow';
import { DEMO_WORKFLOWS } from '../../data/templates';
import { ExecutionHistoryStore } from '../../data/history-store';
import { WorkflowExecutionReport } from '../../types/execution';
import { PageHeader, Input, Button, Badge } from '../components/ui';
import { WorkflowCard } from '../components/workflows/WorkflowCard';
import { Search, Plus, X, Layers, Filter } from 'lucide-react';

export type WorkflowDomain = Workflow['domain'];

export interface WorkflowsScreenProps {
  workflows?: Workflow[];
  onOpenWorkflow: (workflow: Workflow) => void;
  onRunWorkflow: (workflow: Workflow) => void;
  onCreateWorkflow: () => void;
}

const DOMAIN_OPTIONS: { id: 'ALL' | WorkflowDomain; label: string }[] = [
  { id: 'ALL', label: 'All Automations' },
  { id: 'FINANCE', label: 'Finance' },
  { id: 'EDUCATION', label: 'Education' },
  { id: 'HEALTHCARE', label: 'Healthcare' },
  { id: 'PRODUCTIVITY', label: 'Productivity' },
];

export const WorkflowsScreen: React.FC<WorkflowsScreenProps> = ({
  workflows = DEMO_WORKFLOWS,
  onOpenWorkflow,
  onRunWorkflow,
  onCreateWorkflow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<'ALL' | WorkflowDomain>('ALL');
  const [reports, setReports] = useState<WorkflowExecutionReport[]>([]);

  // Subscribe to real execution history store
  useEffect(() => {
    const store = ExecutionHistoryStore.getInstance();
    return store.subscribe(setReports);
  }, []);

  // Map of workflowId -> most recent execution report
  const latestReportMap = useMemo(() => {
    const map = new Map<string, WorkflowExecutionReport>();
    for (const report of reports) {
      if (!map.has(report.workflowId)) {
        map.set(report.workflowId, report);
      }
    }
    return map;
  }, [reports]);

  // Combined Search & Domain Filtering
  const filteredWorkflows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return workflows.filter((wf) => {
      // Domain filter
      if (selectedDomain !== 'ALL' && wf.domain !== selectedDomain) {
        return false;
      }

      // Search query filter
      if (!query) return true;

      const matchesName = wf.name.toLowerCase().includes(query);
      const matchesDesc = wf.description.toLowerCase().includes(query);
      const matchesNodes = wf.nodes.some(
        (n) =>
          n.label.toLowerCase().includes(query) ||
          n.capability.toLowerCase().includes(query)
      );

      return matchesName || matchesDesc || matchesNodes;
    });
  }, [workflows, searchQuery, selectedDomain]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedDomain !== 'ALL';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDomain('ALL');
  };

  return (
    <div className="el-workflows-screen">
      {/* 1. Standard Library Header */}
      <PageHeader
        title="Workflow Library"
        description="Reusable automations you can open, edit, and run."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} aria-hidden="true" />}
            onClick={onCreateWorkflow}
            aria-label="Create new workflow in Studio"
          >
            New Workflow
          </Button>
        }
      />

      {/* 2. Search & Domain Filter Toolbar */}
      <div className="el-library-controls">
        <div className="el-library-search">
          <Input
            leftIcon={<Search size={14} aria-hidden="true" />}
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="el-search-clear-btn"
                  aria-label="Clear search input"
                >
                  <X size={12} />
                </button>
              ) : null
            }
            placeholder="Search workflows by name, description, or capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search workflows"
          />
        </div>

        {/* Domain Filter Pills */}
        <div className="el-library-filter-pills" role="tablist" aria-label="Filter by domain">
          {DOMAIN_OPTIONS.map((opt) => {
            const isSelected = selectedDomain === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                aria-selected={isSelected}
                className={`el-library-filter-pill ${isSelected ? 'el-library-filter-pill--active' : ''}`}
                onClick={() => setSelectedDomain(opt.id)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter State Summary */}
      {hasActiveFilters && (
        <div className="el-library-filter-summary">
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Showing {filteredWorkflows.length} of {workflows.length} automations
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="el-library-clear-btn"
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* 4. Main Library Content */}
      {workflows.length === 0 ? (
        // Empty Library (no workflows configured)
        <div className="el-library-empty">
          <div className="el-library-empty__icon" aria-hidden="true">
            <Layers size={28} />
          </div>
          <h3 className="el-library-empty__title">No workflows yet</h3>
          <p className="el-library-empty__desc">
            Create an automation in Studio and it will appear here in your reusable library.
          </p>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} aria-hidden="true" />}
            onClick={onCreateWorkflow}
          >
            Create Workflow
          </Button>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        // Empty Search/Filter Result
        <div className="el-library-empty">
          <div className="el-library-empty__icon" aria-hidden="true">
            <Filter size={28} />
          </div>
          <h3 className="el-library-empty__title">No matching workflows</h3>
          <p className="el-library-empty__desc">
            Try a different search term or reset your category filters.
          </p>
          <Button variant="secondary" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        // Workflow Cards Grid
        <div className="el-workflow-grid">
          {filteredWorkflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              lastReport={latestReportMap.get(wf.id)}
              onOpen={onOpenWorkflow}
              onRun={onRunWorkflow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
