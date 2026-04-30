import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../api/client';
import type { ApiResponse } from '../../api/client';
import logoUrl from '../../assets/sdi_logo.png';

interface TokenResponse {
  userId: number;
  accessToken: string;
  name: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!loginId || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', {
        loginId,
        password,
      });

      const { accessToken, userId, name } = res.data.data;
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('userId', String(userId));
      sessionStorage.setItem('userName', name);
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <img src={logoUrl} alt="SDI Logo" className="w-10 h-10 object-contain rounded" />
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-wide">SDI</h1>
          <p className="text-brand-textSub mt-2 text-sm">
            <span className="text-brand-primary font-semibold">S</span>ee{' '}
            <span className="text-brand-primary font-semibold">D</span>efect{' '}
            <span className="text-brand-primary font-semibold">I</span>nstantly
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-brand-danger text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">아이디</label>
            <input
              type="text"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-primary/90 transition-colors mt-6 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '로그인'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-brand-textSub text-sm">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-brand-primary hover:underline font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
