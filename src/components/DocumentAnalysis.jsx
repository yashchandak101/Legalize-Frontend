'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function DocumentAnalysis({ documentId, document }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, [documentId]);

  async function fetchAnalyses() {
    try {
      setLoading(true);
      const data = await apiGet(`/api/documents/${documentId}/analyses`);
      setAnalyses(Array.isArray(data) ? data : data.analyses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeDocument(asyncProcessing = true) {
    try {
      setIsAnalyzing(true);
      setError('');
      
      const response = await apiPost(`/api/documents/${documentId}/analyze`, {
        async_processing: asyncProcessing
      });

      if (asyncProcessing) {
        // If processing asynchronously, poll for results
        setTimeout(() => fetchAnalyses(), 2000);
      } else {
        // If synchronous, update immediately
        setAnalyses([response, ...analyses]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }

  function getAnalysisIcon(type) {
    switch (type) {
      case 'key_points': return '🔑';
      case 'legal_terms': return '⚖️';
      case 'risks': return '⚠️';
      case 'recommendations': return '💡';
      case 'summary': return '📄';
      default: return '🔍';
    }
  }

  function getAnalysisTitle(type) {
    switch (type) {
      case 'key_points': return 'Key Points';
      case 'legal_terms': return 'Legal Terms';
      case 'risks': return 'Risks Identified';
      case 'recommendations': return 'Recommendations';
      case 'summary': return 'Document Summary';
      default: return 'Document Analysis';
    }
  }

  if (loading) {
    return (
      <div className="document-analysis">
        <h4>📄 Document Analysis</h4>
        <div className="loading">Loading analysis...</div>
      </div>
    );
  }

  return (
    <div className="document-analysis">
      <div className="analysis-header">
        <h4>📄 Document Analysis</h4>
        <button
          onClick={() => analyzeDocument(true)}
          disabled={isAnalyzing}
          className="btn btn-secondary"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </button>
      </div>

      {document && (
        <div className="document-info">
          <p><strong>File:</strong> {document.original_filename}</p>
          <p><strong>Size:</strong> {Math.round(document.size_bytes / 1024)} KB</p>
          <p><strong>Type:</strong> {document.mime_type}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {analyses.length === 0 && !loading && !error && (
        <div className="no-analysis">
          <p>No AI analysis available yet. Analyze this document to get AI-powered insights.</p>
        </div>
      )}

      {analyses.map((analysis) => (
        <div key={analysis.id} className="analysis-card">
          <div className="analysis-header">
            <h5>
              {getAnalysisIcon(analysis.suggestion_type)} {getAnalysisTitle(analysis.suggestion_type)}
            </h5>
            <span className={`status ${analysis.status}`}>
              {analysis.status}
            </span>
          </div>

          {analysis.status === 'completed' && analysis.suggestions && (
            <div className="analysis-content">
              {Array.isArray(analysis.suggestions) ? (
                <div>
                  {analysis.suggestions.map((item, index) => (
                    <div key={index} className="analysis-item">
                      {typeof item === 'string' ? (
                        <p>{item}</p>
                      ) : (
                        <div>
                          {item.title && <h6>{item.title}</h6>}
                          {item.content && <p>{item.content}</p>}
                          {item.severity && (
                            <span className={`severity ${item.severity}`}>
                              {item.severity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>{analysis.suggestions}</p>
              )}
            </div>
          )}

          {analysis.status === 'pending' && (
            <div className="pending-message">
              ⏳ AI is analyzing the document...
            </div>
          )}

          {analysis.status === 'error' && (
            <div className="error-message">
              ❌ {analysis.error_message || 'Document analysis failed'}
            </div>
          )}

          <div className="analysis-meta">
            <small>
              Provider: {analysis.provider} | Model: {analysis.model} | 
              {analysis.processing_time_ms && ` Processing: ${analysis.processing_time_ms}ms`}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
}
