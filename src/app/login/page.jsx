'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, role);
        setSuccess('Registration successful! You can now log in.');
        setIsRegister(false);
        setPassword('');
      } else {
        await login(email, password);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '420px', margin: '60px auto', padding: '0 24px' }}>
        <div className="card">
          <h1 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '24px', textAlign: 'center' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </h1>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div style={{ background: '#f0fdf4', color: '#166534', padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: '16px', fontSize: '0.9rem', border: '1px solid #bbf7d0' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {isRegister && (
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">Client</option>
                  <option value="lawyer">Lawyer</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
