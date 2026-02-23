'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import { apiGet } from '../../lib/api-client';
import LawyerProfile from '../../components/LawyerProfile';
import { usePagination } from '../../hooks/usePagination';

export default function LawyersPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');

  const { paginatedItems, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev } = usePagination(
    lawyers.filter(lawyer => {
      const matchesSearch = !searchTerm || 
        lawyer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawyer.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialization = !filterSpecialization ||
        lawyer.profile?.specializations?.some(spec => 
          spec.toLowerCase().includes(filterSpecialization.toLowerCase())
        );
      return matchesSearch && matchesSpecialization;
    }), 
    12
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    fetchLawyers();
  }, [user, authLoading]);

  async function fetchLawyers() {
    try {
      const data = await apiGet('/api/lawyers');
      setLawyers(Array.isArray(data) ? data : data.lawyers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectLawyer(lawyer) {
    setSelectedLawyer(selectedLawyer?.id === lawyer.id ? null : lawyer);
  }

  function getSpecializations() {
    const specs = new Set();
    lawyers.forEach(lawyer => {
      if (lawyer.profile?.specializations) {
        if (Array.isArray(lawyer.profile.specializations)) {
          lawyer.profile.specializations.forEach(spec => specs.add(spec));
        } else {
          lawyer.profile.specializations.split(',').forEach(spec => specs.add(spec.trim()));
        }
      }
    });
    return Array.from(specs).sort();
  }

  if (authLoading || !user) return <div className="loading">Loading...</div>;

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <Link href="/" className="navbar-brand">⚖️ Legalize</Link>
          <div className="navbar-links">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/cases">Cases</Link>
            <Link href="/lawyers">Lawyers</Link>
            <Link href="/law-library">Law Library</Link>
            <Link href="/probono">Pro Bono</Link>
            <button onClick={logout} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Find Lawyers</h1>
          <p style={{ color: 'var(--text-light)', margin: '8px 0 0' }}>
            Browse qualified legal professionals and find the right expertise for your case
          </p>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Search Lawyers</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Specialization</label>
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {getSpecializations().map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <button
              className="btn btn-outline"
              onClick={() => {
                setSearchTerm('');
                setFilterSpecialization('');
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading lawyers...</div>
        ) : paginatedItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--text-light)' }}>
              {searchTerm || filterSpecialization ? 'No lawyers match your filters.' : 'No lawyers found.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {paginatedItems.map((lawyer) => (
                <div key={lawyer.id} className="card" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      marginRight: '16px'
                    }}>
                      {lawyer.name?.charAt(0)?.toUpperCase() || 'L'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>
                        {lawyer.name}
                      </h3>
                      <p style={{ margin: '4px 0', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {lawyer.email}
                      </p>
                      {lawyer.profile?.hourly_rate_cents && (
                        <p style={{ margin: '4px 0', fontWeight: '500', color: 'var(--success)' }}>
                          ${(lawyer.profile.hourly_rate_cents / 100).toFixed(2)}/hour
                        </p>
                      )}
                    </div>
                  </div>

                  {lawyer.profile?.specializations && (
                    <div style={{ marginBottom: '12px' }}>
                      <small style={{ color: 'var(--text-light)', fontWeight: '500' }}>Specializations:</small>
                      <div style={{ marginTop: '4px' }}>
                        {Array.isArray(lawyer.profile.specializations) 
                          ? lawyer.profile.specializations.slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="badge badge-secondary" style={{ marginRight: '4px', marginBottom: '4px', fontSize: '0.75rem' }}>
                                {spec}
                              </span>
                            ))
                          : lawyer.profile.specializations.split(',').slice(0, 3).map((spec, idx) => (
                              <span key={idx} className="badge badge-secondary" style={{ marginRight: '4px', marginBottom: '4px', fontSize: '0.75rem' }}>
                                {spec.trim()}
                              </span>
                            ))
                        }
                        {lawyer.profile.specializations.length > 3 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            +{lawyer.profile.specializations.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {lawyer.profile?.bio && (
                    <p style={{ 
                      margin: '12px 0', 
                      fontSize: '0.9rem', 
                      color: 'var(--text-light)',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {lawyer.profile.bio}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSelectLawyer(lawyer)}
                      style={{ flex: 1 }}
                    >
                      {selectedLawyer?.id === lawyer.id ? 'Hide Profile' : 'View Profile'}
                    </button>
                    {user.role === 'user' && (
                      <Link href={`/appointments/new?lawyer_id=${lawyer.id}`} className="btn btn-outline">
                        Book
                      </Link>
                    )}
                  </div>

                  {lawyer.profile?.bar_number && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px',
                      fontSize: '0.75rem',
                      color: 'var(--text-light)'
                    }}>
                      {lawyer.profile.bar_state && `${lawyer.profile.bar_state} `}Bar #{lawyer.profile.bar_number}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: '32px' }}>
                <button onClick={prevPage} disabled={!hasPrev}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={nextPage} disabled={!hasNext}>Next</button>
              </div>
            )}
          </>
        )}

        {/* Selected Lawyer Profile Modal/Section */}
        {selectedLawyer && (
          <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} onClick={() => setSelectedLawyer(null)}>
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              maxWidth: '600px', 
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ margin: 0, color: 'var(--primary)' }}>{selectedLawyer.name}</h2>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setSelectedLawyer(null)}
                    style={{ padding: '4px 12px' }}
                  >
                    ✕
                  </button>
                </div>
                <LawyerProfile lawyerId={selectedLawyer.id} editable={false} />
                {user.role === 'user' && (
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Link href={`/appointments/new?lawyer_id=${selectedLawyer.id}`} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                      Book Consultation
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
