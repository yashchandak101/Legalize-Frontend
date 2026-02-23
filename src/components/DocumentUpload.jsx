'use client';

import { useState, useRef } from 'react';
import { apiPost } from '../lib/api-client';

export default function DocumentUpload({ caseId, onDocumentUploaded, user }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileUpload(file) {
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, Word, text, or image files.');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('case_id', caseId);

      // In a real implementation, you'd use a different API client for file uploads
      // For now, we'll simulate the upload
      const response = await apiPost(`/api/cases/${caseId}/documents`, {
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onDocumentUploaded) {
        onDocumentUploaded(response);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setDragOver(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="document-upload">
      <div className="upload-header">
        <h4>📄 Upload Document</h4>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '4px 0' }}>
          Upload PDF, Word, text, or image files (max 10MB)
        </p>
      </div>

      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p>
            {uploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <strong>Click to upload</strong> or drag and drop
              </>
            )}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
            PDF, Word, Text, or Images (max 10MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '60%' }}></div>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '8px' }}>
            Uploading document...
          </p>
        </div>
      )}
    </div>
  );
}
