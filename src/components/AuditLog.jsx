'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '../lib/api-client';
import { usePagination } from '../hooks/usePagination';

export default function AuditLog({ entityType, entityId, compact = false }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    action: '',
    user_id: '',
    date_from: '',
    date_to: ''
  });

  const { paginatedItems, currentPage, totalPages, nextPage, prevPage, hasNext, hasPrev } = usePagination(
    logs.filter(log => {
      if (filters.action && !log.action.toLowerCase().includes(filters.action.toLowerCase())) {
        return false;
      }
      if (filters.user_id && !log.user_id?.toLowerCase().includes(filters.user_id.toLowerCase())) {
        return false;
      }
      if (filters.date_from && new Date(log.created_at) < new Date(filters.date_from)) {
        return false;
      }
      if (filters.date_to && new Date(log.created_at) > new Date(filters.date_to + 'T23:59:59')) {
        return false;
      }
      return true;
    }),
    compact ? 5 : 20
  );

  useEffect(() => {
    fetchAuditLogs();
  }, [entityType, entityId]);

  async function fetchAuditLogs() {
    try {
      let url = '/api/audit-log';
      const params = new URLSearchParams();
      
      if (entityType) params.append('entity_type', entityType);
      if (entityId) params.append('entity_id', entityId);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const data = await apiGet(url);
      setLogs(Array.isArray(data) ? data : data.logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function formatAction(action) {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function formatEntityType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  function getChangeDisplay(oldValue, newValue) {
    if (!oldValue && !newValue) return null;
    
    try {
      const old = oldValue ? JSON.parse(oldValue) : null;
      const newv = newValue ? JSON.parse(newValue) : null;
      
      if (old && newv && typeof old === 'object' && typeof newv === 'object') {
        const changes = [];
        Object.keys(newv).forEach(key => {
          if (old[key] !== newv[key]) {
            changes.push(`${key}: ${old[key]} → ${newv[key]}`);
          }
        });
        return changes.length > 0 ? changes.join(', ') : null;
      }
      
      return `${oldValue || 'null'} → ${newValue || 'null'}`;
    } catch {
      return `${oldValue || 'null'} → ${newValue || 'null'}`;
    }
  }

  function getActionColor(action) {
    if (action.includes('create') || action.includes('add')) return 'var(--success)';
    if (action.includes('delete') || action.includes('remove')) return 'var(--danger)';
    if (action.includes('update') || action.includes('change')) return 'var(--warning)';
    return 'var(--primary)';
  }

  if (loading) return <div className="loading">Loading audit logs...</div>;

  if (compact) {
    return (
      <div className="card">
        <h4 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Recent Activity</h4>
        {error && <div className="error-message">{error}</div>}
        
        {paginatedItems.length === 0 ? (
          <p style={{ color: 'var(--text-light)', textAlign: 'center' }}>No recent activity.</p>
        ) : (
          <div style={{ fontSize: '0.9rem' }}>
            {paginatedItems.map((log) => (
              <div key={log.id} style={{ 
                padding: '8px 0', 
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: getActionColor(log.action), fontWeight: '500' }}>
                    {formatAction(log.action)}
                  </span>
                  {log.entity_type && (
                    <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>
                      {formatEntityType(log.entity_type)}
                    </span>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {log.user_id} • {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Audit Log</h3>
        <button className="btn btn-outline" onClick={fetchAuditLogs}>
          Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="card" style={{ backgroundColor: 'var(--background)', marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>Filters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Action</label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              placeholder="Filter by action..."
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>User</label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value }))}
              placeholder="Filter by user..."
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            />
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setFilters({ action: '', user_id: '', date_from: '', date_to: '' })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {paginatedItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
          <p>No audit logs found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.9rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {log.user_id || 'System'}
                    </td>
                    <td>
                      <span style={{ 
                        color: getActionColor(log.action),
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      }}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem' }}>
                      {log.entity_type && (
                        <>
                          {formatEntityType(log.entity_type)}
                          {log.entity_id && (
                            <span style={{ color: 'var(--text-light)', marginLeft: '4px' }}>
                              #{log.entity_id}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td style={{ fontSize: '0.9rem', maxWidth: '300px' }}>
                      {getChangeDisplay(log.old_value, log.new_value) || (
                        <span style={{ color: 'var(--text-light)' }}>No changes recorded</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination" style={{ marginTop: '20px' }}>
              <button onClick={prevPage} disabled={!hasPrev}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={nextPage} disabled={!hasNext}>Next</button>
            </div>
          )}
        </>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: 'var(--background)', 
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'var(--text-light)'
      }}>
        <strong>Total Records:</strong> {logs.length} audit entries
        {entityType && ` for ${formatEntityType(entityType)}`}
        {entityId && ` #${entityId}`}
      </div>
    </div>
  );
}
