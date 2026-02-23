'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPut, apiPost } from '../lib/api-client';

export default function LawyerProfile({ lawyerId, editable = false, onSave }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bar_number: '',
    bar_state: '',
    bio: '',
    specializations: '',
    hourly_rate_cents: ''
  });

  useEffect(() => {
    if (lawyerId) {
      fetchProfile();
    }
  }, [lawyerId]);

  async function fetchProfile() {
    try {
      const data = await apiGet(`/api/lawyers/${lawyerId}/profile`);
      setProfile(data);
      setFormData({
        bar_number: data.bar_number || '',
        bar_state: data.bar_state || '',
        bio: data.bio || '',
        specializations: Array.isArray(data.specializations) 
          ? data.specializations.join(', ') 
          : data.specializations || '',
        hourly_rate_cents: data.hourly_rate_cents ? data.hourly_rate_cents / 100 : ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate_cents: formData.hourly_rate_cents ? Math.round(parseFloat(formData.hourly_rate_cents) * 100) : null
      };

      let saved;
      if (profile?.id) {
        saved = await apiPut(`/api/lawyers/${lawyerId}/profile`, payload);
      } else {
        saved = await apiPost(`/api/lawyers/${lawyerId}/profile`, payload);
      }

      setProfile(saved);
      setEditing(false);
      if (onSave) onSave(saved);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile && !editable) return <div className="card"><p>No profile information available.</p></div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Lawyer Profile</h3>
        {editable && (
          <button 
            className="btn btn-outline" 
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        )}
      </div>

      {editing && editable ? (
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Bar Number</label>
            <input
              type="text"
              name="bar_number"
              value={formData.bar_number}
              onChange={handleInputChange}
              placeholder="License/Bar number"
            />
          </div>

          <div className="form-group">
            <label>Bar State</label>
            <input
              type="text"
              name="bar_state"
              value={formData.bar_state}
              onChange={handleInputChange}
              placeholder="State/Jurisdiction"
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>Professional Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              placeholder="Tell clients about your experience and expertise..."
            />
          </div>

          <div className="form-group">
            <label>Specializations</label>
            <input
              type="text"
              name="specializations"
              value={formData.specializations}
              onChange={handleInputChange}
              placeholder="e.g., Corporate Law, IP, Family Law (comma-separated)"
            />
            <small style={{ color: 'var(--text-light)' }}>
              Separate multiple specializations with commas
            </small>
          </div>

          <div className="form-group">
            <label>Hourly Rate ($)</label>
            <input
              type="number"
              name="hourly_rate_cents"
              value={formData.hourly_rate_cents}
              onChange={handleInputChange}
              placeholder="150.00"
              step="0.01"
              min="0"
            />
            <small style={{ color: 'var(--text-light)' }}>
              Optional - displayed to clients
            </small>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary">Save Profile</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div>
          {profile ? (
            <>
              {profile.bar_number && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Bar Number:</strong> {profile.bar_number}
                  {profile.bar_state && ` (${profile.bar_state})`}
                </div>
              )}

              {profile.bio && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Bio:</strong>
                  <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{profile.bio}</p>
                </div>
              )}

              {profile.specializations && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Specializations:</strong>
                  <div style={{ marginTop: '8px' }}>
                    {Array.isArray(profile.specializations) 
                      ? profile.specializations.map((spec, idx) => (
                          <span key={idx} className="badge badge-secondary" style={{ marginRight: '8px', marginBottom: '4px' }}>
                            {spec}
                          </span>
                        ))
                      : profile.specializations.split(',').map((spec, idx) => (
                          <span key={idx} className="badge badge-secondary" style={{ marginRight: '8px', marginBottom: '4px' }}>
                            {spec.trim()}
                          </span>
                        ))
                    }
                  </div>
                </div>
              )}

              {profile.hourly_rate_cents && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Hourly Rate:</strong> ${(profile.hourly_rate_cents / 100).toFixed(2)}
                </div>
              )}

              {profile.created_at && (
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <small style={{ color: 'var(--text-light)' }}>
                    Profile created {new Date(profile.created_at).toLocaleDateString()}
                    {profile.updated_at && ` • Updated ${new Date(profile.updated_at).toLocaleDateString()}`}
                  </small>
                </div>
              )}
            </>
          ) : editable ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
                No profile information yet. Create your profile to showcase your expertise to potential clients.
              </p>
              <button className="btn btn-primary" onClick={() => setEditing(true)}>
                Create Profile
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--text-light)' }}>No profile information available.</p>
          )}
        </div>
      )}
    </div>
  );
}
