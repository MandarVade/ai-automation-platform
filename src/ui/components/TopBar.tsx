import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationActionController, PersistentNotificationState } from '../../core/notification/notification-controller';

export interface TopBarProps {
  currentTab?: string;
  onOpenDeviceSettings?: () => void;
  onNavigateToExecution?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentTab, onNavigateToExecution }) => {
  const [notifState, setNotifState] = useState<PersistentNotificationState>(
    NotificationActionController.getInstance().getState()
  );

  useEffect(() => {
    const unsubNotif = NotificationActionController.getInstance().subscribe(setNotifState);
    return () => {
      unsubNotif();
    };
  }, []);

  const isHome = currentTab === 'home';
  const isRunning = notifState.statusText === 'RUNNING';

  // If on Home and not actively executing an automation, suppress TopBar completely
  // to remove the engineering dashboard strip and keep the Home landing experience clean.
  if (isHome && !isRunning) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Service Status"
      className={`notification-banner ${
        notifState.statusText === 'RUNNING'
          ? 'running'
          : notifState.statusText === 'SUCCESS'
          ? 'completed'
          : 'standby'
      }`}
    >
      <div className="notification-meta" onClick={onNavigateToExecution} style={{ cursor: 'pointer' }}>
        <div className="notification-title">
          <Bell size={14} style={{ color: 'var(--color-accent)' }} />
          <span>{notifState.title}</span>
          <span
            className="status-pill"
            style={{
              fontSize: '10px',
              color:
                notifState.statusText === 'RUNNING'
                  ? 'var(--color-accent)'
                  : notifState.statusText === 'SUCCESS'
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)'
            }}
          >
            {notifState.statusText}
          </span>
        </div>
        <div className="notification-sub">{notifState.subtitle}</div>
        {notifState.statusText === 'RUNNING' && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${notifState.progressPercent}%` }}></div>
          </div>
        )}
      </div>

      <div className="notification-actions">
        {onNavigateToExecution && notifState.statusText !== 'STANDBY' && (
          <button className="btn-notif-action" onClick={onNavigateToExecution}>
            View Live Graph
          </button>
        )}
      </div>
    </div>
  );
};

