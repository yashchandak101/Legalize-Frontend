'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '../lib/api-client';

export default function AnalyticsDashboard({ userRole }) {
  const [analytics, setAnalytics] = useState({
    overview: {},
    trends: [],
    performance: {},
    revenue: {},
    userActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  async function fetchAnalytics() {
    try {
      const data = await apiGet(`/api/analytics?time_range=${timeRange}`);
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function getRangeLabel(range) {
    switch(range) {
      case '7d': return '7 Days';
      case '30d': return '30 Days';
      case '90d': return '90 Days';
      case '1y': return '1 Year';
      default: return range;
    }
  }

  function getChangeColor(change) {
    if (change > 0) return 'var(--success)';
    if (change < 0) return 'var(--danger)';
    return 'var(--text-light)';
  }

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div>
      {/* Time Range Selector */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)' }}>Analytics Dashboard</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['7d', '30d', '90d', '1y'].map(range => (
              <button
                key={range}
                className={`btn ${timeRange === range ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTimeRange(range)}
                style={{ fontSize: '0.9rem', padding: '6px 12px' }}
              >
                {range === '7d' ? '7 Days' : 
                 range === '30d' ? '30 Days' : 
                 range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px' }}>Total Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                {formatNumber(analytics.overview.total_users || 0)}
              </div>
              {analytics.overview.users_change !== undefined && (
                <div style={{ fontSize: '0.85rem', color: getChangeColor(analytics.overview.users_change) }}>
                  {analytics.overview.users_change > 0 ? '+' : ''}{analytics.overview.users_change}% from last period
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>👥</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px' }}>Active Cases</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>
                {formatNumber(analytics.overview.active_cases || 0)}
              </div>
              {analytics.overview.cases_change !== undefined && (
                <div style={{ fontSize: '0.85rem', color: getChangeColor(analytics.overview.cases_change) }}>
                  {analytics.overview.cases_change > 0 ? '+' : ''}{analytics.overview.cases_change}% from last period
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>📋</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px' }}>Revenue</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>
                {formatCurrency(analytics.overview.revenue || 0)}
              </div>
              {analytics.overview.revenue_change !== undefined && (
                <div style={{ fontSize: '0.85rem', color: getChangeColor(analytics.overview.revenue_change) }}>
                  {analytics.overview.revenue_change > 0 ? '+' : ''}{analytics.overview.revenue_change}% from last period
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>💰</div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '4px' }}>Appointments</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info)' }}>
                {formatNumber(analytics.overview.appointments || 0)}
              </div>
              {analytics.overview.appointments_change !== undefined && (
                <div style={{ fontSize: '0.85rem', color: getChangeColor(analytics.overview.appointments_change) }}>
                  {analytics.overview.appointments_change > 0 ? '+' : ''}{analytics.overview.appointments_change}% from last period
                </div>
              )}
            </div>
            <div style={{ fontSize: '2rem', opacity: 0.3, color: 'var(--text-light)' }}>📅</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Trends Chart */}
        <div className="card">
          <h4 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Activity Trends</h4>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📈</div>
              <p>Chart visualization would go here</p>
              <p style={{ fontSize: '0.9rem' }}>Showing trends for {timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : timeRange === '90d' ? 'last 90 days' : 'last year'}</p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="card">
          <h4 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Performance</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Avg. Case Resolution</span>
              <span style={{ fontWeight: 'bold' }}>{analytics.performance.avg_resolution_days || 0} days</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Client Satisfaction</span>
              <span style={{ fontWeight: 'bold' }}>{analytics.performance.client_satisfaction || 0}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>Lawyer Utilization</span>
              <span style={{ fontWeight: 'bold' }}>{analytics.performance.lawyer_utilization || 0}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-light)' }}>AI Response Time</span>
              <span style={{ fontWeight: 'bold' }}>{analytics.performance.ai_response_time || 0}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Lawyers */}
        <div className="card">
          <h4 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Top Performing Lawyers</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th>Lawyer</th>
                  <th>Cases</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_lawyers?.map((lawyer, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '500' }}>{lawyer.name}</td>
                    <td>{lawyer.cases}</td>
                    <td>{formatCurrency(lawyer.revenue)}</td>
                    <td>
                      <span className="badge badge-success">{lawyer.rating}⭐</span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h4 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Recent Activity</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {analytics.recent_activity?.map((activity, index) => (
              <div key={index} style={{ 
                padding: '12px 0', 
                borderBottom: index < analytics.recent_activity.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: activity.type === 'case' ? 'var(--primary)' : 
                                   activity.type === 'appointment' ? 'var(--info)' : 
                                   activity.type === 'payment' ? 'var(--success)' : 'var(--warning)',
                  marginTop: '6px'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{activity.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )) || (
              <div style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="card" style={{ marginTop: '32px' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Export Reports</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
            📊 Export as PDF
          </button>
          <button className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
            📈 Export as Excel
          </button>
          <button className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
            📋 Export as CSV
          </button>
        </div>
      </div>
    </div>
  );
}
