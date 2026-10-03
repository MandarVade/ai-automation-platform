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
            <ExecutionMonitorScreen
              workflow={activeWorkflow}
              onBackToBuilder={() => setIsExecuting(false)}
            />
          </PageContainer>
        ) : selectedWorkflowDetail ? (
          <PageContainer width="wide">
            <WorkflowDetailScreen
              workflow={selectedWorkflowDetail}
              onBack={() => setSelectedWorkflowDetail(null)}
              onEdit={handleEditInVisualBuilder}
              onRun={handleRunWorkflow}
            />
          </PageContainer>
        ) : (
          <>
            {currentTab === 'home' && (
              <PageContainer width="default">
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
              </PageContainer>
            )}

            {(currentTab === 'studio' || currentTab === 'create' || currentTab === 'builder') && (
              <PageContainer width="wide">
                <StudioScreen
                  initialPrompt={initialNLPrompt || undefined}
                  initialWorkflow={activeWorkflow}
                  onRunWorkflow={handleRunWorkflow}
                  activeSubView={studioSubView}
                />
              </PageContainer>
            )}

            {currentTab === 'workflows' && (
              <PageContainer width="wide">
                <WorkflowsScreen
                  workflows={DEMO_WORKFLOWS}
                  onOpenWorkflow={handleEditInVisualBuilder}
                  onRunWorkflow={handleRunWorkflow}
                  onCreateWorkflow={() => {
                    handleStartNLPlan('');
                  }}
                />
              </PageContainer>
            )}

            {currentTab === 'models' && (
              <PageContainer width="wide">
                <ModelRegistryScreen />
              </PageContainer>
            )}

            {currentTab === 'activity' && (
              <PageContainer width="wide">
                <ActivityScreen />
              </PageContainer>
            )}

            {currentTab === 'settings' && (
              <PageContainer width="default">
                <SettingsScreen />
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
