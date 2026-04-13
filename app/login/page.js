'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError('Wrong password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPassword('');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login__ambient login__ambient--1" />
      <div className="login__ambient login__ambient--2" />

      <div className={`login__card ${shake ? 'login__card--shake' : ''}`}>
        <div className="login__logo">
          <span className="login__logo-icon">✓</span>
        </div>
        <h1 className="login__title">ShitTodo</h1>
        <p className="login__subtitle">Enter your password to continue</p>

        <form onSubmit={handleSubmit} className="login__form">
          <div className="login__input-wrapper">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Password"
              className={`login__input ${error ? 'login__input--error' : ''}`}
              autoFocus
              id="login-password"
            />
            {error && <span className="login__error">{error}</span>}
          </div>

          <button
            type="submit"
            className="login__submit"
            disabled={loading || !password.trim()}
            id="login-submit"
          >
            {loading ? (
              <span className="login__spinner" />
            ) : (
              'Enter'
            )}
          </button>
        </form>

        <p className="login__hint">
          <span className="shortcut-hint">Enter</span> to submit
        </p>
      </div>
    </div>
  );
}
