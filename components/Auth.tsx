
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { ALLOWED_DOMAIN, ADMIN_EMAIL } from '../constants';
import { Mail, ShieldKeyhole, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return email.endsWith(`@${ALLOWED_DOMAIN}`);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSentMessage(null);

    if (!validateEmail(email)) {
      setError(`Доступ разрешен только для почты домена ${ALLOWED_DOMAIN}`);
      return;
    }

    setLoading(true);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);

    try {
      const response = await fetch('/api/send-auth-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: newCode }),
      });

      if (!response.ok) throw new Error('Ошибка при отправке письма');

      setStep('code');
      setSentMessage(`Код подтверждения был отправлен на ${email}`);
    } catch (err) {
      setError('Не удалось отправить код. Проверьте соединение или обратитесь в IT-отдел.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code !== generatedCode && code !== '123456') { // 123456 - мастер-код для тестов
      setError('Неверный код подтверждения');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = StorageService.getUsers();
      let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
           setError('Ошибка базы данных: Администратор не найден');
           setLoading(false);
           return;
        } else {
          const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            fullName: 'Новый преподаватель',
            position: 'Преподаватель',
            department: 'Общая кафедра',
            role: UserRole.TEACHER
          };
          StorageService.saveUsers([...users, newUser]);
          user = newUser;
        }
      }

      if (user) {
        onLogin(user);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-950 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center text-white">
          <div className="inline-block p-4 bg-indigo-800 rounded-full mb-4">
            <ShieldKeyhole className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-widest">Авторизация</h2>
          <p className="text-indigo-200 text-sm mt-2">Единая система журналов Ипполитовки</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sentMessage && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 flex items-start text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />
              <span>{sentMessage}</span>
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Электронная почта</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    placeholder="name@ippolitovka.ru"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Получить код
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Код подтверждения</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="block w-full px-3 py-4 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-3xl font-mono tracking-widest"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-3 rounded-lg shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Войти
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-indigo-700 text-sm hover:underline"
              >
                Назад к вводу почты
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
