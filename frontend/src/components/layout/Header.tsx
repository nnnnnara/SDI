import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, User } from 'lucide-react';
import { Badge } from '../common/Badge';

export function Header() {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    navigate('/login');
  };

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
