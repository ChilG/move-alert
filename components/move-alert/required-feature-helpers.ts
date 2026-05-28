import type { BatteryOptimizationStatus } from '@/components/move-alert/settings/battery-optimization-status';

export type ReminderNotificationPermissionStatus = 'denied' | 'granted' | 'loading' | 'unsupported';

export type RequiredFeatureIssue = 'battery-optimization' | 'notification-permission';

type RequiredFeatureStatusInput = {
  batteryOptimizationStatus: BatteryOptimizationStatus | 'loading';
  notificationPermissionStatus: ReminderNotificationPermissionStatus;
};

export function getRequiredFeatureIssues({
  batteryOptimizationStatus,
  notificationPermissionStatus,
}: RequiredFeatureStatusInput): RequiredFeatureIssue[] {
  const issues: RequiredFeatureIssue[] = [];

  if (notificationPermissionStatus === 'denied') {
    issues.push('notification-permission');
  }

  if (batteryOptimizationStatus === 'optimized') {
    issues.push('battery-optimization');
  }

  return issues;
}

export function shouldShowRequiredFeatureWarning(status: RequiredFeatureStatusInput) {
  return getRequiredFeatureIssues(status).length > 0;
}
