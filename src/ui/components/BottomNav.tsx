import React from 'react';

export type NavTab = 'home' | 'create' | 'builder' | 'workflows' | 'models' | 'activity' | 'settings';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>⊞</div>
        <span>Home</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'create' ? 'active' : ''}`}
        onClick={() => onTabChange('create')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>✦</div>
        <span>NL Create</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'builder' ? 'active' : ''}`}
        onClick={() => onTabChange('builder')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>☍</div>
        <span>Visual Builder</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'workflows' ? 'active' : ''}`}
        onClick={() => onTabChange('workflows')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>☰</div>
        <span>Workflows</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'models' ? 'active' : ''}`}
        onClick={() => onTabChange('models')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>⚙</div>
        <span>Models</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'activity' ? 'active' : ''}`}
        onClick={() => onTabChange('activity')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>⏱</div>
        <span>Activity</span>
      </button>

      <button
        className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <div className="nav-icon" style={{ fontSize: '16px' }}>🛡</div>
        <span>Settings</span>
      </button>
    </nav>
  );
};
