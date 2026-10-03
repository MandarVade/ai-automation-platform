import {
  LayoutGrid,
  GitFork,
  Layers,
  Settings,
  Clock,
  FileText,
  X
} from 'lucide-react';
import { cn } from '../utils';
import { NavTab } from './BottomNav';
import { Badge } from './Badge';
import { EL06Emblem, EL06Logo } from './EL06Logo';
import { DeviceContext } from '../../types/device';

export interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  device: DeviceContext;
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
}

interface NavItemDef {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'default' | 'cyber' | 'success' | 'danger' | 'warning' | 'purple';
}

const GitForkInverted: React.FC<{ className?: string }> = ({ className }) => (
  <GitFork className={cn(className, 'rotate-180')} />
);

const navItems: NavItemDef[] = [
  {
    id: 'home',
    label: 'Dashboard',
    icon: LayoutGrid
  },
  {
    id: 'create',
    label: 'NL Create',
    icon: GitForkInverted,
    badge: 'AUTONOMOUS',
    badgeVariant: 'cyber'
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: Layers,
    badge: '3 PIPELINES',
    badgeVariant: 'default'
  },
  {
    id: 'builder',
    label: 'Visual Builder',
    icon: GitFork,
    badge: 'DAG CANVAS',
    badgeVariant: 'purple'
  },
  {
    id: 'models',
    label: 'Model Registry',
    icon: Settings,
    badge: '5 Tiers',
    badgeVariant: 'cyber'
  },
  {
    id: 'activity',
    label: 'Audit Ledger',
    icon: Clock,
    badge: 'PERSISTENT',
    badgeVariant: 'success'
  },
  {
    id: 'settings',
    label: 'Platform Settings',
    icon: FileText
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  device,
  isMobileDrawerOpen,
  onCloseMobileDrawer
}) => {
  return (
    <>
      {/* Mobile Backdrop when Drawer is open */}
      {isMobileDrawerOpen && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar backdrop"
          onClick={onCloseMobileDrawer}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Desktop Fixed 84px Sidebar Rail / Mobile Slide-out Drawer */}
      <aside
        className={cn(
          'flex flex-col border-r-2 border-black bg-[#F4F4F0] select-none shrink-0 h-screen z-45',
          'fixed inset-y-0 left-0 md:relative',
          // Mobile drawer state
          isMobileDrawerOpen
            ? 'w-64 translate-x-0 shadow-[4px_0px_0px_#000]'
            : '-translate-x-full md:translate-x-0',
          // Desktop fixed 84px rail
          'md:w-[84px] md:min-w-[84px] md:max-w-[84px] md:flex-[0_0_84px]'
        )}
        style={{ flex: isMobileDrawerOpen ? undefined : '0 0 84px' }}
      >
        {/* Top Brand Block: Exactly 76px tall, Yellow #FACC15, 2px bottom border */}
        <div className="h-[76px] min-h-[76px] flex items-center justify-center border-b-2 border-black bg-[#FACC15] shrink-0">
          {/* Mobile view with drawer open: show full logo + close button */}
          <div className="flex md:hidden items-center justify-between w-full px-4">
            <div
              onClick={() => {
                onTabChange('home');
                onCloseMobileDrawer();
              }}
              className="cursor-pointer"
            >
              <EL06Logo variant="full" size="sm" showSubtitle={false} />
            </div>
            <button
              onClick={onCloseMobileDrawer}
              aria-label="Close menu"
              className="p-1 border-2 border-black bg-white shadow-[1px_1px_0px_#000]"
            >
              <X className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Desktop view: centered emblem in 84px square */}
          <div
            onClick={() => onTabChange('home')}
            className="hidden md:flex items-center justify-center w-full h-full cursor-pointer hover:bg-amber-300 transition-colors"
            title="EL-06 Automation Command Console"
          >
            <EL06Emblem size={38} />
          </div>
        </div>

        {/* Small NAV Label */}
        <div className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase text-center py-2 shrink-0">
          <span className="hidden md:inline">NAV</span>
          <span className="md:hidden px-4 text-left block w-full">OPERATIONAL NAVIGATION</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col items-center gap-2 px-2 py-1 overflow-y-auto w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobileDrawer();
                }}
                className={cn(
                  'transition-all cursor-pointer font-mono font-bold',
                  // Desktop: 56px x 56px square button
                  'md:w-14 md:h-14 md:p-0 flex items-center md:justify-center',
                  // Mobile drawer: full-width row
                  'w-full px-3 py-2.5 gap-3 justify-start',
                  // Neo-brutalist styling
                  'border-2 border-black',
                  isActive
                    ? 'bg-black text-[#FACC15] shadow-[2px_2px_0px_#FACC15]'
                    : 'bg-white text-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 hover:shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
                )}
                title={item.label}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-[#FACC15]' : 'text-black')} />
                {/* Text label visible only in mobile drawer */}
                <div className="flex md:hidden items-center justify-between flex-1 truncate text-xs">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <Badge variant={item.badgeVariant} className="text-[9px] py-0 px-1 ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Compact status matching JOCKY reference */}
        <div className="p-3 border-t-2 border-black flex flex-col items-center justify-center gap-2 bg-[#F4F4F0] shrink-0">
          {/* Green Pulsing Online Dot */}
          <div
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse"
            title={`${device.deviceModel} (API ${device.androidVersion}) - Online`}
          />

          {/* User/System Badge: Circle with "N" monogram as in reference */}
          <div
            className="w-10 h-10 rounded-full bg-black text-white font-mono font-black text-sm flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-zinc-800 transition-colors"
            title={`EL-06 System Active · ${device.deviceModel}`}
          >
            N
          </div>
        </div>
      </aside>
    </>
  );
};
