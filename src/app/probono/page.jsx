'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function ProBonoPage() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/cases">Cases</Link>
            <Link href="/lawyers">Lawyers</Link>
            <Link href="/probono">Pro Bono</Link>
            {user && <button onClick={logout} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Logout</button>}
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="placeholder-page">
          <h1>🤝 Pro Bono Requests</h1>
          <p>Request free legal assistance for qualifying cases.</p>
          <p style={{ marginTop: '24px', color: 'var(--text-light)' }}>Pro bono request system coming soon.</p>
        </div>
      </div>
    </>
  );
}
