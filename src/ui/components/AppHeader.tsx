import React, { useState } from 'react';
import { NavTab, PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../navigation/nav-config';
import { NavItem } from './ui/Nav';
import { Button } from './ui/Button';
import { SlidersHorizontal, Menu } from 'lucide-react';
import { Sheet } from './ui/Sheet';

export interface AppHeaderProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenDeviceSettings: () => void;
  deviceModel?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenDeviceSettings,
  deviceModel = 'Pixel 8 Pro',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active check supporting transitional Studio child views (create, builder)
  const isItemActive = (tabId: NavTab) => {
    if (tabId === 'studio') {
      return currentTab === 'studio' || currentTab === 'create' || currentTab === 'builder';
    }
    return currentTab === tabId;
  };

  return (
    <>
      <div className="el-app-header">
        {/* Brand Identity */}
        <div className="el-app-header__brand">
          <div className="el-app-header__logo" onClick={() => onTabChange('home')} role="button" tabIndex={0}>
            <span className="el-app-header__logo-badge">EL-06</span>
            <div className="el-app-header__titles">
              <span className="el-app-header__product-name">AI Automation</span>
              <span className="el-app-header__device-pill">{deviceModel}</span>
            </div>
          </div>
        </div>

        {/* Desktop Primary Navigation */}
        <nav className="el-app-header__nav" aria-label="Primary Navigation">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={isItemActive(item.id)}
              onClick={() => onTabChange(item.id)}
            />
          ))}
        </nav>

        {/* Secondary / Action Controls */}
        <div className="el-app-header__actions">
          {/* Secondary Nav Items (Desktop) */}
          <div className="el-app-header__secondary-nav">
            {SECONDARY_NAV_ITEMS.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={isItemActive(item.id)}
                onClick={() => onTabChange(item.id)}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenDeviceSettings}
            className="el-app-header__simulate-btn"
          >
            <SlidersHorizontal size={13} />
            <span>Simulate Device</span>
          </Button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="el-app-header__mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Secondary / System Sheet */}
      <Sheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="EL-06 Navigation & System"
        side="right"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Primary Workflows
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {PRIMARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`el-nav-item ${isItemActive(item.id) ? 'el-nav-item--active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Platform Registry & Settings
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {SECONDARY_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`el-nav-item ${isItemActive(item.id) ? 'el-nav-item--active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start' }}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
            <Button
              variant="secondary"
              size="md"
              style={{ width: '100%' }}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDeviceSettings();
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Simulate Device Constraints</span>
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
};
