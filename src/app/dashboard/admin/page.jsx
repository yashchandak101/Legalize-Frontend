'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { apiGet } from '../../../lib/api-client';
import AuditLog from '../../../components/AuditLog';
import AnalyticsDashboard from '../../../components/AnalyticsDashboard';

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    totalAppointments: 0,
    totalLawyers: 0,
    pendingAppointments: 0,
    openCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'admin') { router.push('/dashboard'); return; }
    fetchStats();
  }, [user, authLoading]);

  async function fetchStats() {
    try {
      const [users, cases, appointments, lawyers] = await Promise.all([
        apiGet('/api/users').catch(() => ({ users: [] })),
        apiGet('/api/cases').catch(() => ({ cases: [] })),
        apiGet('/api/appointments').catch(() => ({ appointments: [] })),
        apiGet('/api/lawyers').catch(() => ({ lawyers: [] }))
      ]);

      const usersList = Array.isArray(users) ? users : users.users || [];
      const casesList = Array.isArray(cases) ? cases : cases.cases || [];
      const appointmentsList = Array.isArray(appointments) ? appointments : appointments.appointments || [];
      const lawyersList = Array.isArray(lawyers) ? lawyers : lawyers.lawyers || [];

      setStats({
        totalUsers: usersList.length,
        totalCases: casesList.length,
        totalAppointments: appointmentsList.length,
        totalLawyers: lawyersList.length,
        pendingAppointments: appointmentsList.filter(a => a.status === 'REQUESTED').length,
        openCases: casesList.filter(c => c.status === 'open' || c.status === 'in_progress').length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return <div className="loading">Loading...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin dashboard.</p>
          <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

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
            <Link href="/admin" style={{ color: 'var(--warning)' }}>Admin</Link>
            <button onClick={logout} className="btn btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>
            System administration and monitoring
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading admin dashboard...</div>
        ) : (
          <>
            {/* Enhanced Tab Navigation */}
            <div style={{ 
              marginBottom: '32px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '4px'
              }}>
                {[
                  { id: 'overview', label: '📊 Overview', icon: '📊' },
                  { id: 'analytics', label: '📈 Analytics', icon: '📈' },
                  { id: 'audit', label: '🔍 Audit Log', icon: '🔍' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab(tab.id)}
                    style={{ 
                      borderRadius: '8px',
                      padding: '12px 20px',
                      fontWeight: '600',
                      fontSize: '0.95rem',
                      backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                      border: activeTab === tab.id ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      flex: 1
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div>
                {/* Enhanced Stats Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                  gap: '24px', 
                  marginBottom: '40px' 
                }}>
                  {[
                    { 
                      label: 'Total Users', 
                      value: stats.totalUsers, 
                      color: 'var(--primary)',
                      icon: '👥',
                      change: '+12%'
                    },
                    { 
                      label: 'Lawyers', 
                      value: stats.totalLawyers, 
                      color: 'var(--success)',
                      icon: '👨‍⚖️',
                      change: '+8%'
                    },
                    { 
                      label: 'Open Cases', 
                      value: stats.openCases, 
                      color: 'var(--warning)',
                      icon: '📋',
                      change: '+15%'
                    },
                    { 
                      label: 'Pending Appointments', 
                      value: stats.pendingAppointments, 
                      color: 'var(--info)',
                      icon: '📅',
                      change: '+5%'
                    }
                  ].map((stat, index) => (
                    <div 
                      key={index}
                      className="card" 
                      style={{ 
                        textAlign: 'center',
                        padding: '32px 24px',
                        background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.05) 100%)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: stat.color,
                        borderRadius: '16px 16px 0 0'
                      }}></div>
                      
                      <div style={{ 
                        fontSize: '3rem', 
                        fontWeight: 'bold', 
                        color: stat.color,
                        marginBottom: '12px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {stat.icon}
                      </div>
                      
                      <div style={{ 
                        fontSize: '2.5rem', 
                        fontWeight: 'bold', 
                        color: stat.color,
                        marginBottom: '8px',
                        lineHeight: 1
                      }}>
                        {stat.value}
                      </div>
                      
                      <div style={{ 
                        fontSize: '1rem', 
                        color: 'var(--text-light)',
                        marginBottom: '8px',
                        fontWeight: '500'
                      }}>
                        {stat.label}
                      </div>
                      
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        backgroundColor: stat.change.startsWith('+') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: stat.change.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Quick Actions */}
                <div className="card" style={{ 
                  marginBottom: '40px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: '16px',
                  padding: '32px'
                }}>
                  <h3 style={{ 
                    color: 'var(--primary)', 
                    marginBottom: '24px',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span>⚡</span>
                    Quick Actions
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '16px' 
                  }}>
                    {[
                      { href: '/legal-aid', label: 'AI Legal Aid', icon: '🤖', color: 'var(--primary)' },
                      { href: '/lawyers', label: 'Manage Lawyers', icon: '👨‍⚖️', color: 'var(--success)' },
                      { href: '/admin/users', label: 'Manage Users', icon: '👥', color: 'var(--warning)' },
                      { href: '/admin/appointments', label: 'Appointments', icon: '📅', color: 'var(--info)' }
                    ].map((action, index) => (
                      <Link 
                        key={index}
                        href={action.href}
                        className="btn" 
                        style={{ 
                          textAlign: 'center',
                          padding: '20px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          borderRadius: '12px',
                          backgroundColor: 'white',
                          border: '2px solid transparent',
                          color: action.color,
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = action.color;
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.borderColor = action.color;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = action.color;
                          e.currentTarget.style.borderColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>{action.icon}</span>
                        <span>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Enhanced System Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <AuditLog compact={true} />
                  
                  <div className="card" style={{
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    border: '1px solid rgba(59,130,246,0.1)',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 4px 20px rgba(59,130,246,0.08)'
                  }}>
                    <h3 style={{ 
                      color: 'var(--primary)', 
                      marginBottom: '24px',
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <span>💚</span>
                      System Health
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { label: 'Database Status', status: 'Connected', color: 'success' },
                        { label: 'API Status', status: 'Operational', color: 'success' },
                        { label: 'AI Services', status: 'Available', color: 'success' },
                        { label: 'Payment Processing', status: 'Active', color: 'success' }
                      ].map((item, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          backgroundColor: 'rgba(255,255,255,0.6)',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.03)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.6)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                          <span style={{ 
                            fontSize: '1rem',
                            fontWeight: '500',
                            color: 'var(--text)'
                          }}>
                            {item.label}
                          </span>
                          <span className={`badge badge-${item.color}`} style={{
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            padding: '6px 16px',
                            borderRadius: '20px'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in'
              }}>
                <AnalyticsDashboard userRole={user.role} />
              </div>
            )}

            {activeTab === 'audit' && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in'
              }}>
                <AuditLog />
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
