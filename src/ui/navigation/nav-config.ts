import { LucideIcon, Home, Workflow, Activity, Cpu, Settings, GitBranch } from 'lucide-react';

export type NavTab = 'home' | 'studio' | 'workflows' | 'activity' | 'models' | 'settings' | 'create' | 'builder';

export interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: LucideIcon;
  description?: string;
  badge?: string | number;
}

export const PRIMARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    description: 'Dashboard & intent creation',
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: Workflow,
    description: 'Unified visual builder & NL planner',
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: GitBranch,
    description: 'Automations library',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    description: 'Execution telemetry & audit history',
  },
];

export const SECONDARY_NAV_ITEMS: NavItemConfig[] = [
  {
    id: 'models',
    label: 'Models',
    icon: Cpu,
    description: 'On-device & cloud model registry',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Runtime quotas, fallback policies & logs',
  },
];
