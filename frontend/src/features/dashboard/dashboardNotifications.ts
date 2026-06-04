export type RealtimeNotificationTone = 'success' | 'warning' | 'danger' | 'info';

export interface RealtimeNotificationInput {
  title: string;
  message: string;
  tone: RealtimeNotificationTone;
  detail?: string;
}

export const DASHBOARD_NOTIFICATION_EVENT = 'dashboard-realtime-notification';
export const DASHBOARD_DATA_REFRESH_EVENT = 'dashboard-data-refresh';

export function dispatchDashboardNotification(notification: RealtimeNotificationInput) {
  window.dispatchEvent(
    new CustomEvent<RealtimeNotificationInput>(DASHBOARD_NOTIFICATION_EVENT, {
      detail: notification,
    })
  );
}

export function dispatchDashboardDataRefresh() {
  window.dispatchEvent(new Event(DASHBOARD_DATA_REFRESH_EVENT));
}
