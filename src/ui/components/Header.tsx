import React, { useEffect, useState } from 'react';
import { Menu, Sliders, Bell, RefreshCw, Settings } from 'lucide-react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { DeviceContext } from '../../types/device';
import {
  NotificationActionController,
  PersistentNotificationState
} from '../../core/notification/notification-controller';
import { NavTab } from './BottomNav';

export interface HeaderProps {
  currentTab: NavTab;
  isExecuting?: boolean;
  onOpenDeviceSettings: () => void;
  onNavigateToExecution?: () => void;
  onToggleMobileDrawer: () => void;
}

const sectionLabels: Record<NavTab, string> = {
  home: 'DASHBOARD',
  create: 'NL CREATE',
  workflows: 'WORKFLOWS',
  builder: 'VISUAL BUILDER',
  models: 'MODEL REGISTRY',
  activity: 'AUDIT LEDGER',
  settings: 'SETTINGS'
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  isExecuting = false,
  onOpenDeviceSettings,
  onNavigateToExecution,
  onToggleMobileDrawer
}) => {
  const [device, setDevice] = useState<DeviceContext>(DeviceContextManager.getInstance().getContext());
  const [notifState, setNotifState] = useState<PersistentNotificationState>(
    NotificationActionController.getInstance().getState()
  );
  const [isDemoTriggered, setIsDemoTriggered] = useState(false);

  useEffect(() => {
    const unsubDevice = DeviceContextManager.getInstance().subscribe(setDevice);
    const unsubNotif = NotificationActionController.getInstance().subscribe(setNotifState);
    return () => {
      unsubDevice();
      unsubNotif();
    };
  }, []);

  const currentSection = isExecuting ? 'LIVE EXECUTION' : sectionLabels[currentTab] || 'DASHBOARD';

  const handleDemoClick = () => {
    setIsDemoTriggered(true);
    setTimeout(() => setIsDemoTriggered(false), 600);
  };

  return (
    <header className="border-b-2 border-black bg-white flex flex-col select-none z-30 shrink-0 min-w-0">
      {/* Top Command Strip: Exactly 76px tall matching reference */}
      <div className="h-[76px] min-h-[76px] flex items-center justify-between px-4 sm:px-6 min-w-0">
        {/* Left: Breadcrumb & Product Statement */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            id="mobile-hamburger-btn"
            onClick={onToggleMobileDrawer}
            aria-label="Toggle Navigation Sidebar"
            className="p-1.5 border-2 border-black bg-white hover:bg-zinc-100 md:hidden shadow-[1px_1px_0px_#000] cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 text-black" />
          </button>

          {/* Route Breadcrumb Badge: Yellow box with 2px black border and shadow */}
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black border-2 border-black bg-[#FACC15] px-3 py-1.5 shadow-[2px_2px_0px_#000] shrink-0">
            <span>{`>_ ${currentSection}`}</span>
          </div>

          {/* Contextual Statement matching reference */}
          <div className="hidden lg:flex items-center text-xs font-mono font-bold text-zinc-600 truncate ml-2">
            <span>One User Intent. Multiple Autonomous Profiles. Verifiable Execution.</span>
          </div>
        </div>

        {/* Right: Telemetry Strip Controls matching reference */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* DEMO button */}
          <button
            type="button"
            onClick={handleDemoClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black bg-white shadow-[2px_2px_0px_#000] hover:bg-zinc-50 active:translate-y-0.5 active:shadow-none cursor-pointer"
            title="Interactive Demo Simulation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDemoTriggered ? 'animate-spin' : ''}`} />
            <span>DEMO</span>
          </button>

          {/* ADAPTIVE ONLINE Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black bg-[#A5F3FC] text-black shadow-[2px_2px_0px_#000]">
            <Settings className="w-3.5 h-3.5 text-black shrink-0" />
            <span>ADAPTIVE ONLINE</span>
          </div>

          {/* CACHE ACTIVE / PROVENANCE SEALED Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black bg-[#A5F3FC] text-black shadow-[2px_2px_0px_#000]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] border border-black inline-block" />
            <span>CACHE SEALED</span>
          </div>

          {/* SIMULATION MODE / REAL RUNTIME Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold border-2 border-black bg-[#FACC15] text-black shadow-[2px_2px_0px_#000]">
            <span className="w-2 h-2 rounded-full bg-black inline-block" />
            <span>SIMULATION MODE</span>
          </div>

          {/* Device Simulator Modal Trigger */}
          <button
            type="button"
            onClick={onOpenDeviceSettings}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-mono font-black border-2 border-black bg-[#FACC15] shadow-[2px_2px_0px_#000] hover:bg-amber-300 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
            title="Adjust Device Hardware, Battery, RAM, and Network Simulation"
          >
            <Sliders className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="hidden sm:inline">SIMULATE DEVICE</span>
            <span className="sm:hidden">SIM</span>
          </button>
        </div>
      </div>

      {/* Persistent Single Notification Controllable Action Bar */}
      {notifState.title && (
        <div
          className={`flex items-center justify-between px-4 sm:px-6 py-1.5 border-t-2 border-black font-mono text-xs font-bold transition-colors cursor-pointer ${
            notifState.statusText === 'RUNNING'
              ? 'bg-amber-200 text-black'
              : notifState.statusText === 'SUCCESS'
              ? 'bg-emerald-200 text-black'
              : 'bg-zinc-100 text-zinc-800'
          }`}
          onClick={onNavigateToExecution}
          title="Click to open execution monitor"
        >
          <div className="flex items-center gap-2 truncate">
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{notifState.title}</span>
            <span className="px-1.5 py-0.2 bg-black text-white text-[10px] border border-black shadow-[1px_1px_0px_#000]">
              {notifState.statusText}
            </span>
          </div>

          <span className="text-[11px] underline shrink-0 ml-2">Open Monitor →</span>
        </div>
      )}
    </header>
  );
};
