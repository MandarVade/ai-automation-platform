import React, { useState } from 'react';
import { Sidebar } from './ui/components/Sidebar';
import { Header } from './ui/components/Header';
import { NavTab } from './ui/components/BottomNav';
import { DeviceResourceModal } from './ui/components/DeviceResourceModal';
import { HomeScreen } from './ui/screens/HomeScreen';
import { CreateScreen } from './ui/screens/CreateScreen';
import { VisualBuilderScreen } from './ui/screens/VisualBuilderScreen';
import { ExecutionMonitorScreen } from './ui/screens/ExecutionMonitorScreen';
import { WorkflowDetailScreen } from './ui/screens/WorkflowDetailScreen';
import { ModelRegistryScreen } from './ui/screens/ModelRegistryScreen';
import { ActivityScreen } from './ui/screens/ActivityScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { DeviceContextManager } from './core/resources/device-context';
import { Workflow } from './types/workflow';
import { DEMO_WORKFLOWS } from './data/templates';
import { Button } from './ui/components/Button';
import { Badge } from './ui/components/Badge';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow>(DEMO_WORKFLOWS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedWorkflowDetail, setSelectedWorkflowDetail] = useState<Workflow | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [initialNLPrompt, setInitialNLPrompt] = useState<string>('');

  // Sidebar state: desktop expanded vs collapsed, mobile drawer open vs closed
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const device = DeviceContextManager.getInstance().getContext();

  // Navigation handlers
  const handleSelectWorkflow = (wf: Workflow) => {
    setSelectedWorkflowDetail(wf);
  };

  const handleRunWorkflow = (wf: Workflow) => {
    setActiveWorkflow(wf);
    setIsExecuting(true);
  };

  const handleStartNLPlan = (prompt: string) => {
    setInitialNLPrompt(prompt);
    setCurrentTab('create');
    setIsExecuting(false);
    setSelectedWorkflowDetail(null);
  };

  const handleEditInVisualBuilder = (wf: Workflow) => {
    setActiveWorkflow(wf);
    setSelectedWorkflowDetail(null);
    setIsExecuting(false);
    setCurrentTab('builder');
  };

  const handleTabChange = (tab: NavTab) => {
    setIsExecuting(false);
    setSelectedWorkflowDetail(null);
    setCurrentTab(tab);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-100 font-sans text-black">
      {/* JOCKY-Style Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        device={device}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Body */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Command Strip */}
        <Header
          currentTab={currentTab}
          isExecuting={isExecuting}
          onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
          onNavigateToExecution={() => setIsExecuting(true)}
          onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        <main className="main-content">
          <div className="w-full max-w-[1500px] mx-auto min-w-0">
            {isExecuting ? (
              <ExecutionMonitorScreen
                workflow={activeWorkflow}
                onBackToBuilder={() => setIsExecuting(false)}
              />
            ) : selectedWorkflowDetail ? (
              <WorkflowDetailScreen
                workflow={selectedWorkflowDetail}
                onBack={() => setSelectedWorkflowDetail(null)}
                onEdit={handleEditInVisualBuilder}
                onRun={handleRunWorkflow}
              />
            ) : (
              <>
                {currentTab === 'home' && (
                  <HomeScreen
                    device={device}
                    onSelectWorkflow={handleSelectWorkflow}
                    onRunWorkflow={handleRunWorkflow}
                    onStartNLPlan={handleStartNLPlan}
                    onOpenVisualBuilder={() => handleTabChange('builder')}
                    onNavigateTab={handleTabChange}
                  />
                )}

                {currentTab === 'create' && (
                  <CreateScreen
                    initialPrompt={initialNLPrompt || undefined}
                    onRunWorkflow={handleRunWorkflow}
                    onEditInVisualBuilder={handleEditInVisualBuilder}
                  />
                )}

                {currentTab === 'builder' && (
                  <VisualBuilderScreen
                    initialWorkflow={activeWorkflow}
                    onRunWorkflow={handleRunWorkflow}
                  />
                )}

                {currentTab === 'workflows' && (
                  <div>
                    {/* Workflows Catalog Header */}
                    <div className="border-3 border-black bg-white p-5 shadow-[4px_4px_0px_#000] mb-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black font-mono uppercase tracking-wider text-black">
                              Automation Pipeline Catalog
                            </h2>
                            <Badge variant="default" className="text-xs">
                              {DEMO_WORKFLOWS.length} Built-in
                            </Badge>
                          </div>
                          <p className="text-xs font-mono text-zinc-600 mt-1">
                            Pre-configured and verified multi-step on-device AI automations for Android.
                          </p>
                        </div>
                        <Button variant="default" size="sm" onClick={() => handleTabChange('create')}>
                          <span>✦</span> Synthesize New
                        </Button>
                      </div>
                    </div>

                    {/* Workflow Cards */}
                    <div className="card-grid">
                      {DEMO_WORKFLOWS.map((wf) => (
                        <div key={wf.id} className="workflow-card">
                          <div>
                            <div className="card-top">
                              <span className={`card-domain-badge ${wf.domain}`}>{wf.domain}</span>
                              <span className="text-[11px] font-mono text-zinc-600 font-bold">
                                v{wf.version} · {wf.nodes.length} NODES
                              </span>
                            </div>
                            <div className="card-name">{wf.name}</div>
                            <div className="card-desc">{wf.description}</div>
                          </div>

                          <div>
                            <div className="card-pipeline-preview mb-4">
                              {wf.nodes.map((node, i) => (
                                <React.Fragment key={node.id}>
                                  <span className="node-chip">{node.label}</span>
                                  {i < wf.nodes.length - 1 && <span className="font-bold">→</span>}
                                </React.Fragment>
                              ))}
                            </div>

                            <div className="card-actions">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectWorkflow(wf)}
                              >
                                Inspect DAG
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleRunWorkflow(wf)}
                              >
                                ▶ Execute Pipeline
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentTab === 'models' && <ModelRegistryScreen />}

                {currentTab === 'activity' && <ActivityScreen />}

                {currentTab === 'settings' && <SettingsScreen />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Device Resource Context Simulator Modal */}
      <DeviceResourceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
};
