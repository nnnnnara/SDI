export type RealtimeNotificationTone = 'success' | 'warning' | 'danger' | 'info';

export interface RealtimeNotificationInput {
  title: string;
  message: string;
  tone: RealtimeNotificationTone;
  detail?: string;
}

export const DASHBOARD_NOTIFICATION_EVENT = 'dashboard-realtime-notification';

export function dispatchDashboardNotification(notification: RealtimeNotificationInput) {
  window.dispatchEvent(
    new CustomEvent<RealtimeNotificationInput>(DASHBOARD_NOTIFICATION_EVENT, {
      detail: notification,
    })
  );
}
