import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Clock, LogOut, Trash2, User } from 'lucide-react';
import { Badge } from '../common/Badge';
import {
  DASHBOARD_NOTIFICATION_EVENT,
  type RealtimeNotificationInput,
} from '../../features/dashboard/dashboardNotifications';

interface HeaderNotification extends RealtimeNotificationInput {
  id: number;
  receivedAt: Date;
  read: boolean;
}

export function Header() {
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationIdRef = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const notification = (event as CustomEvent<RealtimeNotificationInput>).detail;
      if (!notification) return;

      setNotifications((current) => [
        {
          id: ++notificationIdRef.current,
          ...notification,
          receivedAt: new Date(),
          read: false,
        },
        ...current,
      ].slice(0, 50));
    };

    window.addEventListener(DASHBOARD_NOTIFICATION_EVENT, handleNotification);
    return () => window.removeEventListener(DASHBOARD_NOTIFICATION_EVENT, handleNotification);
  }, []);

  const toggleNotificationOpen = useCallback(() => {
    setNotificationOpen((current) => {
      const next = !current;
      if (next) {
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      }
      return next;
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    navigate('/login');
  };

  const unreadNotificationCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="h-16 bg-brand-background border-b border-brand-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-brand-textMain">
          <span className="text-brand-primary">S</span>ee <span className="text-brand-primary">D</span>efect <span className="text-brand-primary">I</span>nstantly
        </h2>
        <Badge variant="info" className="hidden sm:inline-flex">v1.0.0-beta</Badge>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center text-brand-textSub gap-2 text-sm font-medium">
          <Clock className="w-4 h-4" />
          {time.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="h-6 w-px bg-brand-border" />

        <NotificationMenu
          isOpen={notificationOpen}
          notifications={notifications}
          unreadCount={unreadNotificationCount}
          onClear={clearNotifications}
          onToggle={toggleNotificationOpen}
        />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/30">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-brand-textMain leading-tight">{sessionStorage.getItem('userName') || '운영자'}</div>
            <div className="text-xs text-brand-textSub">Factory Operator</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-brand-textSub hover:bg-brand-danger/10 hover:text-brand-danger transition-colors ml-2 border border-transparent hover:border-brand-danger/20"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}

function NotificationMenu({
  isOpen,
  notifications,
  onClear,
  onToggle,
  unreadCount,
}: {
  isOpen: boolean;
  notifications: HeaderNotification[];
  onClear: () => void;
  onToggle: () => void;
  unreadCount: number;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg border text-brand-textSub transition-colors hover:text-brand-textMain ${
          isOpen ? 'border-brand-primary/50 bg-brand-primary/10 text-brand-primary' : 'border-brand-border'
        }`}
        aria-label="Open realtime notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-danger px-1.5 text-[11px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="absolute right-0 top-12 z-40 w-[min(360px,calc(100vw-3rem))] overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-brand-textMain">{'\uc54c\ub9bc'}</h3>
            </div>
            <button
              type="button"
              onClick={onClear}
              disabled={notifications.length === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-brand-textSub hover:bg-brand-border/40 hover:text-brand-textMain disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Clear realtime notifications"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-brand-textSub">
                {'\uc218\uc2e0\ub41c \uc54c\ub9bc\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.'}
              </div>
            ) : (
              <div className="divide-y divide-brand-border/70">
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: HeaderNotification }) {
  const toneClass = {
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    danger: 'bg-brand-danger',
    info: 'bg-brand-info',
  }[notification.tone];

  return (
    <article className="flex gap-3 px-4 py-3">
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${toneClass}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="break-words text-sm font-semibold leading-5 text-brand-textMain">{notification.title}</p>
          <time className="shrink-0 text-[11px] text-brand-textSub">
            {notification.receivedAt.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </time>
        </div>
        <p className="mt-1 break-words text-sm leading-5 text-brand-textSub">{notification.message}</p>
        {notification.detail && (
          <p className="mt-2 break-words text-xs font-medium text-brand-textSub/80">{notification.detail}</p>
        )}
      </div>
    </article>
  );
}
