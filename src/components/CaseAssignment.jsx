'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut } from '../lib/api-client';

export default function CaseAssignment({ caseId, currentAssignment, onAssignmentChange }) {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLawyer, setSelectedLawyer] = useState(currentAssignment?.lawyer_id || '');
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchLawyers();
    fetchAssignmentHistory();
  }, [caseId]);

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

  async function fetchAssignmentHistory() {
    try {
      const data = await apiGet(`/api/cases/${caseId}/assignments`);
      setAssignmentHistory(Array.isArray(data) ? data : data.assignments || []);
    } catch (err) {
      console.error('Failed to fetch assignment history:', err);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    if (!selectedLawyer) return;

    setAssigning(true);
    try {
      const payload = {
        lawyer_id: selectedLawyer,
        notes: notes.trim() || undefined
      };

      const assignment = await apiPost(`/api/cases/${caseId}/assign`, payload);
      
      // Update current assignment
      if (onAssignmentChange) {
        onAssignmentChange(assignment);
      }

      // Refresh history
      fetchAssignmentHistory();
      
      // Reset form
      setNotes('');
      setSelectedLawyer('');
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  }

  function getLawyerName(lawyerId) {
    const lawyer = lawyers.find(l => l.id === lawyerId);
    return lawyer ? lawyer.name : 'Unknown Lawyer';
  }

  if (loading) return <div className="loading">Loading lawyers...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Case Assignment</h3>
        <button 
          className="btn btn-outline" 
          onClick={() => setShowHistory(!showHistory)}
          style={{ fontSize: '0.9rem' }}
        >
          {showHistory ? 'Hide' : 'Show'} History ({assignmentHistory.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Current Assignment */}
      {currentAssignment && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'var(--success)', 
          color: 'white', 
          borderRadius: '8px', 
          marginBottom: '20px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Currently Assigned:</strong> {getLawyerName(currentAssignment.lawyer_id)}
              {currentAssignment.assigned_at && (
                <span style={{ marginLeft: '12px', opacity: 0.9 }}>
                  since {new Date(currentAssignment.assigned_at).toLocaleDateString()}
                </span>
              )}
            </div>
            <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
              Active
            </span>
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <form onSubmit={handleAssign}>
        <div className="form-group">
          <label>Assign to Lawyer</label>
          <select
            value={selectedLawyer}
            onChange={(e) => setSelectedLawyer(e.target.value)}
            required
          >
            <option value="">Select a lawyer...</option>
            {lawyers.map(lawyer => (
              <option key={lawyer.id} value={lawyer.id}>
                {lawyer.name} {lawyer.email && `(${lawyer.email})`}
                {lawyer.profile?.specializations && ` - ${lawyer.profile.specializations.slice(0, 2).join(', ')}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assignment Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Reason for assignment or special instructions..."
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!selectedLawyer || assigning}
        >
          {assigning ? 'Assigning...' : currentAssignment ? 'Reassign Case' : 'Assign Case'}
        </button>
      </form>

      {/* Assignment History */}
      {showHistory && assignmentHistory.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 16px 0', color: 'var(--primary)' }}>Assignment History</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {assignmentHistory.map((assignment) => (
              <div 
                key={assignment.id} 
                className="card" 
                style={{ 
                  padding: '12px', 
                  backgroundColor: assignment.status === 'active' ? 'var(--background)' : 'white',
                  border: assignment.status === 'active' ? '2px solid var(--primary)' : '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{getLawyerName(assignment.lawyer_id)}</strong>
                    {assignment.assigned_at && (
                      <span style={{ marginLeft: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {new Date(assignment.assigned_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className={`badge badge-${assignment.status === 'active' ? 'success' : 'secondary'}`}>
                    {assignment.status}
                  </span>
                </div>
                
                {assignment.notes && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    {assignment.notes}
                  </p>
                )}

                {assignment.assigned_by && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    Assigned by: {assignment.assigned_by}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showHistory && assignmentHistory.length === 0 && (
        <div style={{ 
          marginTop: '24px', 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: 'var(--background)', 
          borderRadius: '8px',
          color: 'var(--text-light)'
        }}>
          No assignment history available.
        </div>
      )}
    </div>
  );
}
