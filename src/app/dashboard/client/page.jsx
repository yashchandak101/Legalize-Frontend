'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { apiGet, apiPost } from '../../../lib/api-client';

export default function ClientDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchCases();
  }, [user, authLoading]);

  async function fetchCases() {
    try {
      const data = await apiGet('/api/cases');
      setCases(Array.isArray(data) ? data : data.cases || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCase(e) {
    e.preventDefault();
    setFormError('');
    try {
      await apiPost('/api/cases', { title, description });
      setTitle('');
      setDescription('');
      setShowForm(false);
      fetchCases();
    } catch (err) {
      setFormError(err.message);
    }
  }

  if (authLoading || !user) return <div className="loading">Loading...</div>;

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/legal-aid">AI Legal Aid</Link>
            <Link href="/lawyers">Lawyers</Link>
            <Link href="/law-library">Law Library</Link>
            <Link href="/probono">Pro Bono</Link>
            <button onClick={logout} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Client Dashboard</h1>
            <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>Welcome, {user.email}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Case'}
          </button>
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>Create New Case</h3>
            {formError && <div className="error-message">{formError}</div>}
            <form onSubmit={handleCreateCase}>
              <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Case title" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe your case" />
              </div>
              <button type="submit" className="btn btn-primary">Create Case</button>
            </form>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--text-light)' }}>No cases yet. Create your first case to get started.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                    <td><span className={`badge badge-${(c.status || 'open').toLowerCase()}`}>{c.status || 'Open'}</span></td>
                    <td style={{ color: 'var(--text-light)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                    <td><Link href={`/cases/${c.id}`} className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
