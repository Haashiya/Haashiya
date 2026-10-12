"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState<'error' | 'success' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password: password.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setMsgType('error');
        setMessage(data.error || "حدث خطأ غير متوقع");
        setLoading(false);
        return;
      }

      // Login successful
      const userSession = data.user;
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      if (data.token) localStorage.setItem('authToken', data.token);
      
      setMsgType('success');
      setMessage("تم تسجيل الدخول بنجاح! جاري التوجيه...");

      setTimeout(() => {
        router.push("/archive");
      }, 1000);

    } catch (err) {
      console.error('Login Error:', err);
      setMsgType('error');
      setMessage("حدث خطأ أثناء الاتصال بقاعدة البيانات");
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>مرحباً بك!</h2>
      <p className="subtitle">يُرجَى تسجيل الدخول باستخدام البيانات المزوَّدة لك</p>

      <form id="loginForm" onSubmit={handleLoginSubmit}>
        <div className="input-group">
          <label htmlFor="username">اسم المستخدم</label>
          <input 
            type="text" 
            id="username" 
            placeholder="أدخل اسم المستخدم" 
            required 
            autoComplete="off" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">كلمة المرور</label>
          <input 
            type="password" 
            id="password" 
            placeholder="أدخل كلمة المرور" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
        </button>
        {message && (
          <div id="message" className={`message ${msgType}`}>
            {message}
          </div>
        )}
      </form>

      <button 
        className="back-home-link" 
        onClick={() => router.push('/')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--color-primary-600)' }}
      >
        &rarr; العودة للرئيسية
      </button>
    </div>
  );
}
