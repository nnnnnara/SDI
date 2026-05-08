import { Link, useLocation } from 'react-router-dom';
import { Camera, ClipboardList, FileText, History, LayoutDashboard, Settings, Terminal } from 'lucide-react';
import logoUrl from '../../assets/sdi_logo.png';

const MENU_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: '공정 관제', icon: LayoutDashboard },
  { id: 'history', path: '/history', label: '공정 이력', icon: History },
  { id: 'inspection', path: '/inspection', label: '검사 결과', icon: ClipboardList },
  { id: 'env-log', path: '/env-log', label: '환경 로그', icon: FileText },
  { id: 'sys-log', path: '/sys-log', label: '시스템 로그', icon: Terminal },
  { id: 'camera', path: '/camera', label: '카메라 모니터링', icon: Camera },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-brand-card border-r border-brand-border h-screen flex flex-col shrink-0">
      <Link
        to="/dashboard"
        aria-label="홈으로 이동"
        className="h-16 flex items-center px-6 border-b border-brand-border transition-colors hover:bg-brand-border/20 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary/40"
      >
        <img src={logoUrl} alt="SDI Logo" className="w-8 h-8 mr-3 object-contain rounded" />
        <h1 className="text-xl font-bold text-brand-textMain tracking-wide">SDI</h1>
      </Link>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-brand-textSub uppercase tracking-wider mb-4 px-2">Main Menu</div>
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-colors duration-200 group ${
                isActive
                  ? 'bg-brand-primary/10 text-brand-primary'
                  : 'text-brand-textSub hover:bg-brand-border/30 hover:text-brand-textMain'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-primary' : 'group-hover:text-brand-textMain'}`} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <button className="w-full flex items-center px-3 py-3 rounded-lg text-brand-textSub hover:bg-brand-border/30 hover:text-brand-textMain transition-colors duration-200">
          <Settings className="w-5 h-5 mr-3" />
          <span className="font-medium">설정</span>
        </button>
      </div>
    </aside>
  );
}
