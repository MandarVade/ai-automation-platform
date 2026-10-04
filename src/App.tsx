import React, { useState } from 'react';
import { TopBar } from './ui/components/TopBar';
import { AppHeader } from './ui/components/AppHeader';
import { BottomNav } from './ui/components/BottomNav';
import { DeviceResourceModal } from './ui/components/DeviceResourceModal';
import { HomeScreen } from './ui/screens/HomeScreen';
import { StudioScreen } from './ui/screens/StudioScreen';
import { WorkflowsScreen } from './ui/screens/WorkflowsScreen';
import { ExecutionMonitorScreen } from './ui/screens/ExecutionMonitorScreen';
import { WorkflowDetailScreen } from './ui/screens/WorkflowDetailScreen';
import { ModelRegistryScreen } from './ui/screens/ModelRegistryScreen';
import { ActivityScreen } from './ui/screens/ActivityScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { DeviceContextManager } from './core/resources/device-context';
import { Workflow } from './types/workflow';
import { DEMO_WORKFLOWS } from './data/templates';
import { NavTab } from './ui/navigation/nav-config';
import { PageContainer, PageHeader } from './ui/components/ui';
import { PageMotion } from './ui/motion';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow>(DEMO_WORKFLOWS[0]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedWorkflowDetail, setSelectedWorkflowDetail] = useState<Workflow | null>(null);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [initialNLPrompt, setInitialNLPrompt] = useState<string>('');
  const [studioSubView, setStudioSubView] = useState<'create' | 'builder'>('builder');

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
    setStudioSubView('create');
    setCurrentTab('studio');
  };

  const handleEditInVisualBuilder = (wf: Workflow) => {
    setActiveWorkflow(wf);
    setSelectedWorkflowDetail(null);
    setStudioSubView('builder');
    setCurrentTab('studio');
  };

  const handleTabChange = (tab: NavTab) => {
    setIsExecuting(false);
    setSelectedWorkflowDetail(null);
    if (tab === 'create') {
      setStudioSubView('create');
      setCurrentTab('studio');
    } else if (tab === 'builder') {
      setStudioSubView('builder');
      setCurrentTab('studio');
    } else {
      setCurrentTab(tab);
    }
  };

  return (
    <div className="app-container">
      {/* Top System Bar & Notification Controller */}
      <TopBar
        currentTab={currentTab}
        onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
        onNavigateToExecution={() => setIsExecuting(true)}
      />

      {/* EL-06 Primary Desktop/Mobile Header */}
      <AppHeader
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
        deviceModel={device.deviceModel}
      />

      {/* Main Screen Content */}
      <main className="main-content">
        {isExecuting ? (
          <PageContainer width="wide">
            <PageMotion id="page-execution">
              <ExecutionMonitorScreen
                workflow={activeWorkflow}
                onBackToBuilder={() => setIsExecuting(false)}
              />
            </PageMotion>
          </PageContainer>
        ) : selectedWorkflowDetail ? (
          <PageContainer width="wide">
            <PageMotion id="page-workflow-detail">
              <WorkflowDetailScreen
                workflow={selectedWorkflowDetail}
                onBack={() => setSelectedWorkflowDetail(null)}
                onEdit={handleEditInVisualBuilder}
                onRun={handleRunWorkflow}
              />
            </PageMotion>
          </PageContainer>
        ) : (
          <>
            {currentTab === 'home' && (
              <PageContainer width="default">
                <PageMotion id="page-home">
                  <HomeScreen
                    device={device}
                    onSelectWorkflow={handleSelectWorkflow}
                    onRunWorkflow={handleRunWorkflow}
                    onStartNLPlan={handleStartNLPlan}
                    onOpenVisualBuilder={() => {
                      setStudioSubView('builder');
                      setCurrentTab('studio');
                    }}
                  />
                </PageMotion>
              </PageContainer>
            )}

            {(currentTab === 'studio' || currentTab === 'create' || currentTab === 'builder') && (
              <PageContainer width="wide">
                <PageMotion id="page-studio">
                  <StudioScreen
                    initialPrompt={initialNLPrompt || undefined}
                    initialWorkflow={activeWorkflow}
                    onRunWorkflow={handleRunWorkflow}
                    activeSubView={studioSubView}
                  />
                </PageMotion>
              </PageContainer>
            )}

            {currentTab === 'workflows' && (
              <PageContainer width="wide">
                <PageMotion id="page-workflows">
                  <WorkflowsScreen
                    workflows={DEMO_WORKFLOWS}
                    onOpenWorkflow={handleEditInVisualBuilder}
                    onRunWorkflow={handleRunWorkflow}
                    onCreateWorkflow={() => {
                      handleStartNLPlan('');
                    }}
                  />
                </PageMotion>
              </PageContainer>
            )}

            {currentTab === 'models' && (
              <PageContainer width="wide">
                <PageMotion id="page-models">
                  <ModelRegistryScreen />
                </PageMotion>
              </PageContainer>
            )}

            {currentTab === 'activity' && (
              <PageContainer width="wide">
                <PageMotion id="page-activity">
                  <ActivityScreen onRunWorkflow={handleRunWorkflow} />
                </PageMotion>
              </PageContainer>
            )}

            {currentTab === 'settings' && (
              <PageContainer width="default">
                <PageMotion id="page-settings">
                  <SettingsScreen />
                </PageMotion>
              </PageContainer>
            )}
          </>
        )}
      </main>

      {/* Android System Bottom Navigation (4-Item Primary) */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />

      {/* Device Resource Context Simulator Modal */}
      <DeviceResourceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />
    </div>
  );
};
