'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';
import { useAuth } from '../hooks/useAuth';

export default function CaseComments({ caseId, userRole }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchComments();
  }, [caseId]);

  async function fetchComments() {
    try {
      const data = await apiGet(`/api/cases/${caseId}/comments`);
      setComments(Array.isArray(data) ? data : data.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        body: newComment.trim(),
        is_internal: isInternal,
        parent_id: replyingTo || undefined
      };

      const comment = await apiPost(`/api/cases/${caseId}/comments`, payload);
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setIsInternal(false);
      setReplyingTo(null);
      setReplyText('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitReply(e) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        body: replyText.trim(),
        is_internal: isInternal,
        parent_id: replyingTo
      };

      const comment = await apiPost(`/api/cases/${caseId}/comments`, payload);
      
      setComments(prev => [comment, ...prev]);
      setReplyText('');
      setReplyingTo(null);
      setIsInternal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function canViewComment(comment) {
    // Clients cannot see internal comments
    if (userRole === 'user' && comment.is_internal) {
      return false;
    }
    return true;
  }

  function canMakeInternalComments() {
    // Only lawyers and admins can make internal comments
    return userRole === 'lawyer' || userRole === 'admin';
  }

  function getUserName(userId) {
    // This would ideally come from user data, but for now we'll use the user ID
    return userId;
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  function renderComment(comment, isReply = false) {
    if (!canViewComment(comment)) return null;

    return (
      <div 
        key={comment.id} 
        style={{ 
          marginLeft: isReply ? '32px' : '0',
          marginBottom: '16px',
          padding: isReply ? '12px' : '16px',
          backgroundColor: isReply ? 'var(--background)' : 'white',
          border: '1px solid var(--border)',
          borderRadius: '8px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {getUserName(comment.user_id)?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>{getUserName(comment.user_id)}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                {formatTime(comment.created_at)}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {comment.is_internal && (
              <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                Internal
              </span>
            )}
            {!isReply && (
              <button 
                className="btn btn-outline" 
                onClick={() => setReplyingTo(comment.id)}
                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
              >
                Reply
              </button>
            )}
          </div>
        </div>

        <p style={{ 
          margin: '0', 
          lineHeight: '1.5', 
          whiteSpace: 'pre-wrap',
          color: comment.is_internal ? 'var(--warning)' : 'var(--text)'
        }}>
          {comment.body}
        </p>

        {comment.updated_at && comment.updated_at !== comment.created_at && (
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
            Edited {formatTime(comment.updated_at)}
          </div>
        )}

        {/* Reply form */}
        {replyingTo === comment.id && (
          <form onSubmit={handleSubmitReply} style={{ marginTop: '16px' }}>
            {canMakeInternalComments() && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                />
                <span style={{ fontSize: '0.9rem' }}>Internal comment (lawyers only)</span>
              </label>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                style={{ flex: 1, resize: 'vertical' }}
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!replyText.trim() || submitting}
                  style={{ padding: '8px 16px' }}
                >
                  {submitting ? '...' : 'Reply'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                    setIsInternal(false);
                  }}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (loading) return <div className="loading">Loading comments...</div>;

  return (
    <div className="card">
      <h3 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Case Discussion</h3>

      {error && <div className="error-message">{error}</div>}

      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} style={{ marginBottom: '24px' }}>
        {canMakeInternalComments() && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
            <span style={{ fontSize: '0.9rem' }}>
              Internal comment {userRole === 'lawyer' ? '(lawyers only)' : '(admin only)'}
            </span>
          </label>
        )}
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isInternal ? "Write an internal note..." : "Add a comment..."}
              rows={3}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!newComment.trim() || submitting}
            style={{ padding: '12px 24px', height: 'fit-content' }}
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: 'var(--text-light)',
          backgroundColor: 'var(--background)',
          borderRadius: '8px'
        }}>
          <p>No comments yet. Start the discussion!</p>
        </div>
      ) : (
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {comments
            .filter(comment => !comment.parent_id) // Only show top-level comments
            .map(comment => (
              <div key={comment.id}>
                {renderComment(comment)}
                {/* Render replies */}
                {comments
                  .filter(reply => reply.parent_id === comment.id)
                  .map(reply => renderComment(reply, true))}
              </div>
            ))}
        </div>
      )}

      {comments.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          paddingTop: '16px', 
          borderTop: '1px solid var(--border)',
          fontSize: '0.9rem',
          color: 'var(--text-light)'
        }}>
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
          {comments.filter(c => c.is_internal).length > 0 && (
            <span> • {comments.filter(c => c.is_internal).length} internal</span>
          )}
        </div>
      )}
    </div>
  );
}
