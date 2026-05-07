import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleHelp, Cpu, Loader2 } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../api/client';
import type { ApiResponse } from '../../api/client';

interface SignupResponse {
  userId: number;
  loginId: string;
  name: string;
}

type SignupField = 'loginId' | 'password' | 'name' | 'employeeNo';
type SignupErrors = Partial<Record<SignupField, string>>;

const fieldBaseClass =
  'w-full bg-brand-background border rounded-lg px-4 py-2.5 text-brand-textMain placeholder:text-brand-textSub/70 focus:outline-none focus:ring-1 transition-colors';
const fieldNormalClass = 'border-brand-border focus:border-brand-primary focus:ring-brand-primary';
const fieldErrorClass = 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger';

const signupRules = {
  loginId: '영문, 숫자, 밑줄(_)만 사용해 4~20자로 입력해 주세요.',
  password: '영문, 숫자, 특수문자를 모두 포함해 8~32자로 입력해 주세요.',
  name: '한글 또는 영문 2~20자로 입력해 주세요.',
  employeeNo: '숫자 7자로 입력해 주세요.',
};

function FieldHint({ message }: { message: string }) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="text-brand-textSub hover:text-brand-primary focus:outline-none focus:text-brand-primary"
        aria-label={message}
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <div className="pointer-events-none absolute right-0 top-6 z-10 hidden w-64 rounded-lg border border-brand-border bg-slate-950 px-3 py-2 text-xs leading-5 text-brand-textMain shadow-xl group-hover:block group-focus-within:block">
        {message}
      </div>
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    name: '',
    employeeNo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignupErrors>({});
  const [touched, setTouched] = useState<Partial<Record<SignupField, boolean>>>({});

  const validate = (data = formData) => {
    const nextErrors: SignupErrors = {};
    const trimmedLoginId = data.loginId.trim();
    const trimmedName = data.name.trim();
    const trimmedEmployeeNo = data.employeeNo.trim();

    if (!trimmedLoginId) {
      nextErrors.loginId = '아이디를 입력해 주세요.';
    } else if (!/^[A-Za-z0-9_]{4,20}$/.test(trimmedLoginId)) {
      nextErrors.loginId = signupRules.loginId;
    }

    if (!data.password) {
      nextErrors.password = '비밀번호를 입력해 주세요.';
    } else if (
      data.password.length < 8 ||
      data.password.length > 32 ||
      !/[A-Za-z]/.test(data.password) ||
      !/[0-9]/.test(data.password) ||
      !/[^A-Za-z0-9]/.test(data.password)
    ) {
      nextErrors.password = signupRules.password;
    }

    if (!trimmedName) {
      nextErrors.name = '이름을 입력해 주세요.';
    } else if (!/^[가-힣A-Za-z\s]{2,20}$/.test(trimmedName)) {
      nextErrors.name = signupRules.name;
    }

    if (!trimmedEmployeeNo) {
      nextErrors.employeeNo = '사번을 입력해 주세요.';
    } else if (!/^[A-Za-z0-9-]{4,20}$/.test(trimmedEmployeeNo)) {
      nextErrors.employeeNo = signupRules.employeeNo;
    }

    return nextErrors;
  };

  const updateFieldError = (field: SignupField, nextData = formData) => {
    const nextErrors = validate(nextData);
    setFieldErrors((prev) => ({ ...prev, [field]: nextErrors[field] }));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as SignupField;
    const nextData = { ...formData, [field]: value };

    setFormData(nextData);
    if (touched[field]) {
      updateFieldError(field, nextData);
    }
  };

  const handleBlur = (field: SignupField) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    updateFieldError(field);
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const nextErrors = validate();
    setFieldErrors(nextErrors);
    setTouched({ loginId: true, password: true, name: true, employeeNo: true });

    if (Object.keys(nextErrors).length > 0) {
      setError('입력값을 확인해 주세요.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', {
        loginId: formData.loginId.trim(),
        password: formData.password,
        name: formData.name.trim(),
        employeeNo: formData.employeeNo.trim(),
      });
      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      navigate('/login');
    } catch (err: unknown) {
      console.error(err);
      const message = axios.isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-card border border-brand-border rounded-2xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4">
            <Cpu className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-2xl font-bold text-brand-textMain tracking-wide">계정 생성</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-brand-danger text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="signup-loginId" className="block text-sm font-medium text-brand-textSub">
                아이디
              </label>
              <FieldHint message={signupRules.loginId} />
            </div>
            <input
              id="signup-loginId"
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              onBlur={() => handleBlur('loginId')}
              className={`${fieldBaseClass} ${fieldErrors.loginId ? fieldErrorClass : fieldNormalClass}`}
              placeholder="영문, 숫자 포함 4~20자"
              aria-invalid={Boolean(fieldErrors.loginId)}
              aria-describedby={fieldErrors.loginId ? 'signup-loginId-error' : undefined}
            />
            {fieldErrors.loginId && (
              <p id="signup-loginId-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.loginId}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="signup-password" className="block text-sm font-medium text-brand-textSub">
                비밀번호
              </label>
              <FieldHint message={signupRules.password} />
            </div>
            <input
              id="signup-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`${fieldBaseClass} ${fieldErrors.password ? fieldErrorClass : fieldNormalClass}`}
              placeholder="영문, 숫자, 특수문자 포함 8~32자"
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
            />
            {fieldErrors.password && (
              <p id="signup-password-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="signup-name" className="block text-sm font-medium text-brand-textSub">
                이름
              </label>
              <FieldHint message={signupRules.name} />
            </div>
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              className={`${fieldBaseClass} ${fieldErrors.name ? fieldErrorClass : fieldNormalClass}`}
              placeholder="한글 또는 영문 2~20자"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? 'signup-name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="signup-name-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="signup-employeeNo" className="block text-sm font-medium text-brand-textSub">
                사번
              </label>
              <FieldHint message={signupRules.employeeNo} />
            </div>
            <input
              id="signup-employeeNo"
              type="text"
              name="employeeNo"
              value={formData.employeeNo}
              onChange={handleChange}
              onBlur={() => handleBlur('employeeNo')}
              className={`${fieldBaseClass} ${fieldErrors.employeeNo ? fieldErrorClass : fieldNormalClass}`}
              placeholder="예: 1400000"
              aria-invalid={Boolean(fieldErrors.employeeNo)}
              aria-describedby={fieldErrors.employeeNo ? 'signup-employeeNo-error' : undefined}
            />
            {fieldErrors.employeeNo && (
              <p id="signup-employeeNo-error" className="mt-1.5 text-xs text-brand-danger">
                {fieldErrors.employeeNo}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-70 transition-colors mt-6 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '계정 생성'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-brand-textSub text-sm">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-brand-primary hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
