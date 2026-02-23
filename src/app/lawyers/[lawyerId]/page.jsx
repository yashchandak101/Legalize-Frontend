'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function LawyerDetailPage() {
  const params = useParams();
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/lawyers">Lawyers</Link>
            {user && <button onClick={logout} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Logout</button>}
          </div>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <Link href="/lawyers" style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>← Back to Lawyers</Link>
        </div>

        <div className="card">
          <h2 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Lawyer Profile</h2>
          <p style={{ color: 'var(--text-light)' }}>Lawyer ID: {params.lawyerId}</p>
          <p style={{ color: 'var(--text-light)', marginTop: '16px' }}>Detailed lawyer profiles coming soon.</p>
        </div>
      </div>
    </>
  );
}
