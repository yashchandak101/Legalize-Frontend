'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function LegalQA({ caseId, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load initial suggestions
    setSuggestions([
      "What are the key legal issues in my case?",
      "What documents do I need to prepare?",
      "What are the potential outcomes?",
      "How long might this case take?",
      "What are my rights in this situation?"
    ]);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      const response = await apiPost(`/api/cases/${caseId}/legal-qa`, {
        question: userMessage.content,
        conversation_history: messages.slice(-5) // Send last 5 messages for context
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.answer,
        sources: response.sources || [],
        confidence: response.confidence || 'medium',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: `Sorry, I encountered an error: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(suggestion) {
    setInput(suggestion);
    setShowSuggestions(false);
  }

  function formatMessage(content) {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  }

  function getConfidenceColor(confidence) {
    switch (confidence.toLowerCase()) {
      case 'high': return 'var(--success)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--danger)';
      default: return 'var(--text-light)';
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Legal Q&A Assistant</h3>
        <button 
          className="btn btn-outline" 
          onClick={() => {
            setMessages([]);
            setShowSuggestions(true);
            setError('');
          }}
          style={{ fontSize: '0.9rem' }}
        >
          Clear Chat
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Chat Messages */}
      <div style={{ 
        height: '400px', 
        overflowY: 'auto', 
        border: '1px solid var(--border)', 
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: 'var(--background)',
        marginBottom: '16px'
      }}>
        {messages.length === 0 && showSuggestions && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🤖</div>
            <h4 style={{ color: 'var(--primary)', marginBottom: '12px' }}>Ask me anything about your case</h4>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
              I can help you understand legal concepts, procedures, and potential outcomes.
            </p>
            
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '12px' }}>
                Try asking:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="btn btn-outline"
                    style={{ 
                      fontSize: '0.85rem', 
                      padding: '6px 12px',
                      textAlign: 'left',
                      maxWidth: '100%'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div 
            key={message.id} 
            style={{ 
              marginBottom: '16px',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? 'var(--primary)' : 
                             message.type === 'error' ? 'var(--danger)' : 'white',
              color: message.type === 'user' || message.type === 'error' ? 'white' : 'var(--text)',
              border: message.type === 'ai' ? '1px solid var(--border)' : 'none'
            }}>
              {message.type === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>🤖</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>AI Assistant</span>
                  {message.confidence && (
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: getConfidenceColor(message.confidence),
                        fontSize: '0.7rem',
                        marginLeft: 'auto'
                      }}
                    >
                      {message.confidence} confidence
                    </span>
                  )}
                </div>
              )}
              
              <div 
                style={{ lineHeight: '1.5' }}
                dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
              />
              
              {message.sources && message.sources.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '6px' }}>
                    📚 Sources:
                  </div>
                  {message.sources.map((source, index) => (
                    <div key={index} style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      • {source}
                    </div>
                  ))}
                </div>
              )}
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: message.type === 'user' || message.type === 'error' ? 'rgba(255,255,255,0.7)' : 'var(--text-light)',
                marginTop: '8px'
              }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'white',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span style={{ color: 'var(--text-light)' }}>Thinking...</span>
              <div style={{ display: 'flex', gap: '4px' }}>
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
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a legal question about your case..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!input.trim() || loading}
          style={{ padding: '12px 24px' }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>

      <div style={{ 
        marginTop: '12px', 
        fontSize: '0.85rem', 
        color: 'var(--text-light)',
        textAlign: 'center'
      }}>
        <p>⚠️ AI responses are for informational purposes only and do not constitute legal advice.</p>
        <p>Always consult with a qualified attorney for legal matters.</p>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
