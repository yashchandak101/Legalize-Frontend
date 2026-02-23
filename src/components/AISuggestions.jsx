'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function AISuggestions({ caseId, user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, [caseId]);

  async function fetchSuggestions() {
    try {
      setLoading(true);
      const data = await apiGet(`/api/cases/${caseId}/suggestions`);
      setSuggestions(Array.isArray(data) ? data : data.suggestions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateSuggestions(asyncProcessing = true) {
    try {
      setIsGenerating(true);
      setError('');
      
      const response = await apiPost(`/api/cases/${caseId}/suggestions`, {
        async_processing: asyncProcessing
      });

      if (asyncProcessing) {
        // If processing asynchronously, poll for results
        setTimeout(() => fetchSuggestions(), 2000);
      } else {
        // If synchronous, update immediately
        setSuggestions([response, ...suggestions]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  }

  function getSuggestionIcon(type) {
    switch (type) {
      case 'legal_issues': return '⚖️';
      case 'recommended_actions': return '📋';
      case 'relevant_laws': return '📚';
      case 'timeline_suggestions': return '📅';
      case 'risk_assessment': return '⚠️';
      default: return '🤖';
    }
  }

  function getSuggestionTitle(type) {
    switch (type) {
      case 'legal_issues': return 'Legal Issues';
      case 'recommended_actions': return 'Recommended Actions';
      case 'relevant_laws': return 'Relevant Laws';
      case 'timeline_suggestions': return 'Timeline Suggestions';
      case 'risk_assessment': return 'Risk Assessment';
      default: return 'AI Insights';
    }
  }

  if (loading) {
    return (
      <div className="ai-suggestions">
        <h3>🤖 AI Legal Analysis</h3>
        <div className="loading">Loading AI suggestions...</div>
      </div>
    );
  }

  return (
    <div className="ai-suggestions">
      <div className="ai-header">
        <h3>🤖 AI Legal Analysis</h3>
        <button
          onClick={() => generateSuggestions(true)}
          disabled={isGenerating}
          className="btn btn-primary"
        >
          {isGenerating ? 'Generating...' : 'Generate AI Suggestions'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {suggestions.length === 0 && !loading && !error && (
        <div className="no-suggestions">
          <p>No AI suggestions available yet. Generate suggestions to get AI-powered legal insights.</p>
        </div>
      )}

      {suggestions.map((suggestion) => (
        <div key={suggestion.id} className="suggestion-card">
          <div className="suggestion-header">
            <h4>
              {getSuggestionIcon(suggestion.suggestion_type)} {getSuggestionTitle(suggestion.suggestion_type)}
            </h4>
            <span className={`status ${suggestion.status}`}>
              {suggestion.status}
            </span>
          </div>

          {suggestion.status === 'completed' && suggestion.suggestions && (
            <div className="suggestion-content">
              {Array.isArray(suggestion.suggestions) ? (
                <ul>
                  {suggestion.suggestions.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p>{suggestion.suggestions}</p>
              )}
            </div>
          )}

          {suggestion.status === 'pending' && (
            <div className="pending-message">
              ⏳ AI is analyzing this case...
            </div>
          )}

          {suggestion.status === 'error' && (
            <div className="error-message">
              ❌ {suggestion.error_message || 'AI analysis failed'}
            </div>
          )}

          <div className="suggestion-meta">
            <small>
              Provider: {suggestion.provider} | Model: {suggestion.model} | 
              {suggestion.processing_time_ms && ` Processing: ${suggestion.processing_time_ms}ms`}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
