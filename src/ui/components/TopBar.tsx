import React, { useEffect, useState } from 'react';
import { DeviceContextManager } from '../../core/resources/device-context';
import { DeviceContext } from '../../types/device';
import { NotificationActionController, PersistentNotificationState } from '../../core/notification/notification-controller';

interface TopBarProps {
  onOpenDeviceSettings: () => void;
  onNavigateToExecution?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenDeviceSettings, onNavigateToExecution }) => {
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
      {/* Android System Status Bar */}
      <div className="system-status-bar">
        <div className="left-group">
          <span>10:42 PM</span>
          <span className="status-pill" title="Hardware Model & Android OS">
            <span className="status-dot green"></span>
            {device.deviceModel} (API {device.androidVersion})
          </span>
        </div>

        <div className="right-group">
          <span className="status-pill" title="Network Connectivity">
            <span className={`status-dot ${device.networkState === 'OFFLINE' ? 'red' : 'green'}`}></span>
            {networkLabel}
          </span>
          <span className="status-pill" title="Available Device Memory">
            RAM: {device.availableRamMb} / {device.totalRamMb} MB
          </span>
          <span className="status-pill" title="Battery & Charging State">
            <span className={`status-dot ${device.batteryPercentage < 20 ? 'red' : 'green'}`}></span>
            {device.batteryPercentage}% {device.isCharging ? '⚡' : ''}
          </span>
          <span className="status-pill" title="Thermal Throttling State">
            <span className={`status-dot ${thermalColor}`}></span>
            {device.thermalStatus}
          </span>
          <button
            className="status-pill"
            style={{ cursor: 'pointer', background: 'var(--bg-surface-3)', color: 'var(--accent-cyan)' }}
            onClick={onOpenDeviceSettings}
            title="Adjust Device Context Simulation"
          >
            ⚙️ Simulate Device
          </button>
        </div>
      </div>

      {/* Official PS Feature: Single Notification Controllable Action Bar */}
      <div
        className={`notification-banner ${
          notifState.statusText === 'RUNNING'
            ? 'running'
            : notifState.statusText === 'SUCCESS'
            ? 'completed'
            : ''
        }`}
      >
        <div className="notification-meta" onClick={onNavigateToExecution} style={{ cursor: 'pointer' }}>
          <div className="notification-title">
            <span style={{ fontSize: '14px' }}>🔔</span>
            <span>{notifState.title}</span>
            <span
              className="status-pill"
              style={{
                fontSize: '10px',
                color:
                  notifState.statusText === 'RUNNING'
                    ? 'var(--accent-blue)'
                    : notifState.statusText === 'SUCCESS'
                    ? 'var(--status-success)'
                    : 'var(--text-muted)'
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
          {onNavigateToExecution && (
            <button className="btn-notif-action" onClick={onNavigateToExecution}>
              View Live Graph
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
