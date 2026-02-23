'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function AppointmentRecap({ appointmentId, userRole }) {
  const [recap, setRecap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      fetchRecap();
    }
  }, [appointmentId]);

  async function fetchRecap() {
    try {
      const data = await apiGet(`/api/appointments/${appointmentId}/recap`);
      setRecap(data);
    } catch (err) {
      // Don't show error for missing recaps, just log it
      console.log('No recap available yet');
    }
  }

  async function generateRecap() {
    setGenerating(true);
    setError('');
    try {
      const data = await apiPost(`/api/appointments/${appointmentId}/recap`, {});
      setRecap(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function formatRecapContent(content) {
    if (!content) return '';
    
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
      .replace(/• (.*)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  }

  function getRecapType() {
    if (!recap) return null;
    if (recap.type === 'summary') return 'Summary';
    if (recap.type === 'detailed') return 'Detailed Recap';
    if (recap.type === 'action_items') return 'Action Items';
    return 'Recap';
  }

  function getConfidenceColor(confidence) {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--danger)';
      default: return 'var(--text-light)';
    }
  }

  // Only show for lawyers and admins for completed appointments
  if (!['lawyer', 'admin'].includes(userRole)) {
    return null;
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Appointment Recap</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {recap && (
            <button 
              className="btn btn-outline" 
              onClick={() => setShowFull(!showFull)}
              style={{ fontSize: '0.9rem' }}
            >
              {showFull ? 'Compact View' : 'Full View'}
            </button>
          )}
          {!recap && !generating && (
            <button 
              className="btn btn-primary" 
              onClick={generateRecap}
              style={{ fontSize: '0.9rem' }}
            >
              Generate Recap
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {generating && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: 'var(--text-light)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤔</div>
          <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Analyzing Appointment</h4>
          <p>AI is processing the appointment details to generate a comprehensive recap...</p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '4px', 
            marginTop: '20px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              animation: 'bounce 1.4s infinite ease-in-out both'
            }}></div>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.16s'
            }}></div>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--primary)',
              animation: 'bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.32s'
            }}></div>
          </div>
        </div>
      )}

      {recap && (
        <div>
          {/* Recap Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '16px',
            backgroundColor: 'var(--background)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
                {getRecapType()}
              </span>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginTop: '4px' }}>
                Generated {new Date(recap.created_at).toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {recap.confidence && (
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Confidence: </span>
                  <span style={{ 
                    color: getConfidenceColor(recap.confidence),
                    fontWeight: '500'
                  }}>
                    {recap.confidence}
                  </span>
                </div>
              )}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Model: {recap.model || 'AI Assistant'}
              </div>
            </div>
          </div>

          {/* Key Points */}
          {recap.key_points && recap.key_points.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>🔑 Key Points</h4>
              <div style={{ 
                backgroundColor: 'var(--background)', 
                padding: '16px', 
                borderRadius: '8px' 
              }}>
                {recap.key_points.map((point, index) => (
                  <div key={index} style={{ 
                    marginBottom: index < recap.key_points.length - 1 ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      color: 'var(--primary)', 
                      fontWeight: 'bold',
                      minWidth: '20px'
                    }}>
                      {index + 1}.
                    </span>
                    <span style={{ lineHeight: '1.5' }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {recap.summary && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>📝 Summary</h4>
              <div style={{ 
                backgroundColor: 'var(--background)', 
                padding: '16px', 
                borderRadius: '8px',
                lineHeight: '1.6'
              }}>
                <div dangerouslySetInnerHTML={{ __html: formatRecapContent(recap.summary) }} />
              </div>
            </div>
          )}

          {/* Action Items */}
          {recap.action_items && recap.action_items.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>✅ Action Items</h4>
              <div style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                {recap.action_items.map((item, index) => (
                  <div key={index} style={{ 
                    marginBottom: index < recap.action_items.length - 1 ? '12px' : '0',
                    padding: '12px',
                    backgroundColor: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: '2px' }}
                      onChange={(e) => {
                        // Could implement tracking of completed action items
                        console.log(`Action item ${index} ${e.target.checked ? 'completed' : 'uncompleted'}`);
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{item.title}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                          {item.description}
                        </div>
                      )}
                      {item.assignee && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '4px' }}>
                          Assigned to: {item.assignee}
                        </div>
                      )}
                      {item.due_date && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginTop: '4px' }}>
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Content (if available) */}
          {showFull && recap.full_content && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>📄 Full Transcript Analysis</h4>
              <div style={{ 
                backgroundColor: 'var(--background)', 
                padding: '16px', 
                borderRadius: '8px',
                lineHeight: '1.6',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div dangerouslySetInnerHTML={{ __html: formatRecapContent(recap.full_content) }} />
              </div>
            </div>
          )}

          {/* Next Steps */}
          {recap.next_steps && recap.next_steps.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>🚀 Next Steps</h4>
              <div style={{ backgroundColor: 'var(--background)', padding: '16px', borderRadius: '8px' }}>
                {recap.next_steps.map((step, index) => (
                  <div key={index} style={{ 
                    marginBottom: index < recap.next_steps.length - 1 ? '12px' : '0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ color: 'var(--success)', fontSize: '1.2rem' }}>→</span>
                    <span style={{ lineHeight: '1.5' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            backgroundColor: 'var(--background)', 
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: 'var(--text-light)',
            textAlign: 'center'
          }}>
            <p>This recap was generated by AI based on appointment information.</p>
            <p>Please review for accuracy and completeness.</p>
          </div>
        </div>
      )}

      {!recap && !generating && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          color: 'var(--text-light)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📋</div>
          <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>No Recap Available</h4>
          <p>Generate an AI-powered recap of this appointment to summarize key points and action items.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
