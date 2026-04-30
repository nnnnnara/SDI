import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Loader2 } from 'lucide-react';
import axios from 'axios';
import { apiClient } from '../../api/client';
import type { ApiResponse } from '../../api/client';

interface SignupResponse {
  userId: number;
  loginId: string;
  name: string;
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!formData.loginId || !formData.password || !formData.name || !formData.employeeNo) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', formData);
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">아이디</label>
            <input
              type="text"
              name="loginId"
              value={formData.loginId}
              onChange={handleChange}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="사용할 아이디"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="비밀번호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="이름"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-textSub mb-1">사번</label>
            <input
              type="text"
              name="employeeNo"
              value={formData.employeeNo}
              onChange={handleChange}
              className="w-full bg-brand-background border border-brand-border rounded-lg px-4 py-2.5 text-brand-textMain focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              placeholder="사번"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg hover:bg-brand-primary/90 transition-colors mt-6 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '회원가입'}
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
