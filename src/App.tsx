import React, { useState } from 'react';
import { TopBar } from './ui/components/TopBar';
import { BottomNav, NavTab } from './ui/components/BottomNav';
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

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow>(DEMO_WORKFLOWS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedWorkflowDetail, setSelectedWorkflowDetail] = useState<Workflow | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [initialNLPrompt, setInitialNLPrompt] = useState<string>('');

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
  };

  const handleEditInVisualBuilder = (wf: Workflow) => {
    setActiveWorkflow(wf);
    setSelectedWorkflowDetail(null);
    setCurrentTab('builder');
  };

  return (
    <div className="app-container">
      {/* System Bar & Single Notification Controllable Action */}
      <TopBar
        onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
        onNavigateToExecution={() => setIsExecuting(true)}
      />

      {/* Main Screen Content */}
      <main className="main-content">
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
                onOpenVisualBuilder={() => setCurrentTab('builder')}
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
                <div className="section-header">
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Workflow Library</h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Pre-configured and user-defined multi-step AI automations.
                    </p>
                  </div>
                </div>

                <div className="card-grid">
                  {DEMO_WORKFLOWS.map((wf) => (
                    <div key={wf.id} className="workflow-card">
                      <div>
                        <div className="card-top">
                          <span className={`card-domain-badge ${wf.domain}`}>{wf.domain}</span>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            v{wf.version}
                          </span>
                        </div>
                        <div className="card-name">{wf.name}</div>
                        <div className="card-desc">{wf.description}</div>
                      </div>

                      <div className="card-actions">
                        <button className="btn-secondary" onClick={() => handleSelectWorkflow(wf)}>
                          View Details
                        </button>
                        <button className="btn-primary" onClick={() => handleRunWorkflow(wf)}>
                          ▶ Run
                        </button>
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
      </main>

      {/* Android System Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setIsExecuting(false);
          setSelectedWorkflowDetail(null);
          setCurrentTab(tab);
        }}
      />

      {/* Device Resource Context Simulator Modal */}
      <DeviceResourceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
};
