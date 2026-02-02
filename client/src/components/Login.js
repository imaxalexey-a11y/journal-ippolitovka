import React, { useState } from 'react';
import { sendAuthCode, verifyCode } from '../api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' или 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await sendAuthCode(email);
      setMessage('Код отправлен на вашу почту');
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyCode(email, code);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = () => {
    setStep('email');
    setCode('');
    setMessage('');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: '400px', width: '90%' }}>
        <h1 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>
          Журнал посещаемости
        </h1>
        
        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label>Email (@ippolitovka.ru)</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@ippolitovka.ru"
                required
                disabled={loading}
              />
            </div>
            
            {error && <div className="error">{error}</div>}
            {message && <div className="success">{message}</div>}
            
            <button 
              type="submit" 
              className="button button-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Получить код'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label>Введите код из письма</label>
              <input
                type="text"
                className="input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
                autoFocus
              />
              <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                Код отправлен на {email}
              </small>
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button 
              type="submit" 
              className="button button-primary" 
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Проверка...' : 'Войти'}
            </button>
            
            <button 
              type="button" 
              className="button button-secondary" 
              style={{ width: '100%', marginTop: '10px' }}
              onClick={handleResendCode}
              disabled={loading}
            >
              Отправить код повторно
            </button>
          </form>
        )}
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
          <p>Доступ только для сотрудников с email @ippolitovka.ru</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
