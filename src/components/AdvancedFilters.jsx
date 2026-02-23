'use client';

import { useState } from 'react';

export default function AdvancedFilters({ filters, onFiltersChange, availableOptions = {} }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      assigned_lawyer: '',
      date_from: '',
      date_to: '',
      priority: '',
      sort_by: 'created_at',
      sort_order: 'desc'
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value && value !== '' && value !== 'created_at' && value !== 'desc'
  ).length;

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: isExpanded ? '16px' : '0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>
            Filters & Sorting
          </h3>
          {activeFilterCount > 0 && (
            <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {activeFilterCount > 0 && (
            <button 
              className="btn btn-outline" 
              onClick={clearAllFilters}
              style={{ fontSize: '0.9rem' }}
            >
              Clear All
            </button>
          )}
          <button 
            className="btn btn-outline" 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ fontSize: '0.9rem' }}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {/* Basic Search - Always Visible */}
      <div className="form-group" style={{ marginBottom: isExpanded ? '16px' : '0' }}>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Search cases by title, description, or client..."
          style={{ width: '100%' }}
        />
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Status Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Assigned Lawyer Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Assigned Lawyer</label>
            <select
              value={filters.assigned_lawyer || ''}
              onChange={(e) => handleFilterChange('assigned_lawyer', e.target.value)}
            >
              <option value="">All Lawyers</option>
              {availableOptions.lawyers?.map(lawyer => (
                <option key={lawyer.id} value={lawyer.id}>
                  {lawyer.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date From */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>From Date</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>To Date</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Sort By</label>
            <select
              value={filters.sort_by || 'created_at'}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Last Updated</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="assigned_lawyer_id">Assigned Lawyer</option>
            </select>
          </div>

          {/* Sort Order */}
          <div className="form-group" style={{ margin: 0 }}>
            <label>Order</label>
            <select
              value={filters.sort_order || 'desc'}
              onChange={(e) => handleFilterChange('sort_order', e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: 'var(--background)', 
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '8px' }}>Active Filters:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filters.search && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Search: "{filters.search}"
                <button 
                  onClick={() => handleFilterChange('search', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.status && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Status: {filters.status}
                <button 
                  onClick={() => handleFilterChange('status', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.assigned_lawyer && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Lawyer: {availableOptions.lawyers?.find(l => l.id === filters.assigned_lawyer)?.name || filters.assigned_lawyer}
                <button 
                  onClick={() => handleFilterChange('assigned_lawyer', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Priority: {filters.priority}
                <button 
                  onClick={() => handleFilterChange('priority', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.date_from && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                From: {new Date(filters.date_from).toLocaleDateString()}
                <button 
                  onClick={() => handleFilterChange('date_from', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
            {filters.date_to && (
              <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                To: {new Date(filters.date_to).toLocaleDateString()}
                <button 
                  onClick={() => handleFilterChange('date_to', '')}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '0' }}
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
