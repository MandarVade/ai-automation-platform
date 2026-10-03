import React from 'react';
import { NavTab, PRIMARY_NAV_ITEMS } from '../navigation/nav-config';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const isItemActive = (tabId: NavTab) => {
    if (tabId === 'studio') {
      return currentTab === 'studio' || currentTab === 'create' || currentTab === 'builder';
    }
    return currentTab === tabId;
  };

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {PRIMARY_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.id);
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${active ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-current={active ? 'page' : undefined}
          >
            <div className="nav-icon">
              <Icon size={18} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
