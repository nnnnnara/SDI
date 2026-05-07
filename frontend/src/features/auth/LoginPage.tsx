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

type LoginField = 'loginId' | 'password';
type LoginErrors = Partial<Record<LoginField, string>>;

const fieldBaseClass =
  'w-full bg-brand-background border rounded-lg px-4 py-2.5 text-brand-textMain placeholder:text-brand-textSub/70 focus:outline-none focus:ring-1 transition-colors';
const fieldNormalClass = 'border-brand-border focus:border-brand-primary focus:ring-brand-primary';
const fieldErrorClass = 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger';

export function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});

  const validate = (data = { loginId, password }) => {
    const nextErrors: LoginErrors = {};

    if (!data.loginId.trim()) {
      nextErrors.loginId = '아이디를 입력해 주세요.';
    }

    if (!data.password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    }

    return nextErrors;
  };

  const updateFieldError = (field: LoginField, nextData = { loginId, password }) => {
    const nextErrors = validate(nextData);
    setFieldErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setTouched({ loginId: true, password: true });

    if (Object.keys(nextErrors).length > 0) {
      setError('입력값을 확인해 주세요.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', {
        loginId: loginId.trim(),
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
      setError(message || '로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해 주세요.');
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

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="loginId" className="mb-1 block text-sm font-medium text-brand-textSub">
              아이디
            </label>
            <input
              id="loginId"
              type="text"
              value={loginId}
              onChange={(event) => {
                const nextLoginId = event.target.value;
                setLoginId(nextLoginId);
                if (touched.loginId) updateFieldError('loginId', { loginId: nextLoginId, password });
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, loginId: true }));
                updateFieldError('loginId');
              }}
              className={`${fieldBaseClass} ${fieldErrors.loginId ? fieldErrorClass : fieldNormalClass}`}
              placeholder="아이디를 입력하세요"
              aria-invalid={Boolean(fieldErrors.loginId)}
              aria-describedby={fieldErrors.loginId ? 'loginId-error' : undefined}
            />
            {fieldErrors.loginId && (
              <p id="loginId-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.loginId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-textSub">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => {
                const nextPassword = event.target.value;
                setPassword(nextPassword);
                if (touched.password) updateFieldError('password', { loginId, password: nextPassword });
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }));
                updateFieldError('password');
              }}
              className={`${fieldBaseClass} ${fieldErrors.password ? fieldErrorClass : fieldNormalClass}`}
              placeholder="비밀번호를 입력하세요"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <p id="password-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-70 transition-colors mt-6 flex items-center justify-center"
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
