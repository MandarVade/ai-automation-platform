import React, { useEffect, useState } from 'react';
import { Bell, SlidersHorizontal, Zap, Wifi, WifiOff, Battery, Flame, Smartphone } from 'lucide-react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { DeviceContext } from '../../types/device';
import { NotificationActionController, PersistentNotificationState } from '../../core/notification/notification-controller';

export interface TopBarProps {
  currentTab?: string;
  onOpenDeviceSettings: () => void;
  onNavigateToExecution?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ currentTab, onOpenDeviceSettings, onNavigateToExecution }) => {
  const [device, setDevice] = useState<DeviceContext>(DeviceContextManager.getInstance().getContext());
  const [notifState, setNotifState] = useState<PersistentNotificationState>(
    NotificationActionController.getInstance().getState()
  );

  useEffect(() => {
    const unsubDevice = DeviceContextManager.getInstance().subscribe(setDevice);
    const unsubNotif = NotificationActionController.getInstance().subscribe(setNotifState);
    return () => {
      unsubDevice();
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

  const thermalColor =
    device.thermalStatus === 'NOMINAL' ? 'green' : device.thermalStatus === 'MODERATE' ? 'yellow' : 'red';

  const networkLabel =
    device.networkState === 'WIFI_HIGH_SPEED'
      ? 'Wi-Fi 6'
      : device.networkState === 'CELLULAR_4G_5G'
      ? '5G'
      : device.networkState === 'CELLULAR_METRED'
      ? 'LTE Metred'
      : 'Offline';

  return (
    <header>
      {/* Android System Status Bar (omitted on Home to eliminate dashboard chrome) */}
      {!isHome && (
        <div className="system-status-bar">
          <div className="left-group">
            <span>10:42 PM</span>
            <span className="status-pill" title="Hardware Model & Android OS">
              <Smartphone size={12} style={{ color: 'var(--color-text-secondary)' }} />
              <span className="status-dot green"></span>
              {device.deviceModel} (API {device.androidVersion})
            </span>
          </div>

          <div className="right-group">
            <span className="status-pill" title="Network Connectivity">
              {device.networkState === 'OFFLINE' ? (
                <WifiOff size={12} style={{ color: 'var(--color-error)' }} />
              ) : (
                <Wifi size={12} style={{ color: 'var(--color-success)' }} />
              )}
              <span className={`status-dot ${device.networkState === 'OFFLINE' ? 'red' : 'green'}`}></span>
              {networkLabel}
            </span>
            <span className="status-pill" title="Available Device Memory">
              RAM: {device.availableRamMb} / {device.totalRamMb} MB
            </span>
            <span className="status-pill" title="Battery & Charging State">
              <Battery size={12} style={{ color: device.batteryPercentage < 20 ? 'var(--color-error)' : 'var(--color-text-secondary)' }} />
              <span className={`status-dot ${device.batteryPercentage < 20 ? 'red' : 'green'}`}></span>
              {device.batteryPercentage}%
              {device.isCharging && <Zap size={11} style={{ color: 'var(--color-warning)' }} />}
            </span>
            <span className="status-pill" title="Thermal Throttling State">
              <Flame size={12} style={{ color: thermalColor === 'green' ? 'var(--color-success)' : thermalColor === 'yellow' ? 'var(--color-warning)' : 'var(--color-error)' }} />
              <span className={`status-dot ${thermalColor}`}></span>
              {device.thermalStatus}
            </span>
            <button
              className="status-pill"
              style={{ cursor: 'pointer', background: 'var(--color-surface-interactive)', color: 'var(--color-accent)' }}
              onClick={onOpenDeviceSettings}
              title="Adjust Device Context Simulation"
            >
              <SlidersHorizontal size={12} />
              <span>Simulate Device</span>
            </button>
          </div>
        </div>
      )}

      {/* Official PS Feature: Single Notification Controllable Action Bar */}
      <div
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
    </header>
  );
};
