'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function Payment({ caseId, user }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (caseId) {
      fetchPayments();
    }
  }, [caseId]);

  async function fetchPayments() {
    try {
      setLoading(true);
      const data = await apiGet(`/api/cases/${caseId}/payments`);
      setPayments(Array.isArray(data) ? data : data.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPaymentIntent() {
    try {
      setProcessing(true);
      setError('');
      
      const response = await apiPost(`/api/cases/${caseId}/payments`, {
        amount_cents: Math.round(parseFloat(amount) * 100), // Convert to cents
        currency: 'usd',
        description: `Payment for case ${caseId}`
      });

      // Redirect to Stripe checkout or handle client secret
      if (response.stripe_client_secret) {
        // In a real implementation, you would use Stripe Elements here
        // For now, we'll just show the payment intent info
        alert(`Payment intent created! Client secret: ${response.stripe_client_secret}`);
        setShowPaymentForm(false);
        setAmount('');
        fetchPayments();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function refundPayment(paymentId) {
    try {
      await apiPost(`/api/payments/${paymentId}/refund`);
      fetchPayments();
    } catch (err) {
      setError(err.message);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'completed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'failed': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  }

  function formatAmount(cents) {
    return (cents / 100).toFixed(2);
  }

  function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="payments">
        <h4>💳 Payments</h4>
        <div className="loading">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payments">
      <div className="payments-header">
        <h4>💳 Payments</h4>
        <button
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className="btn btn-primary"
        >
          Make Payment
        </button>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {showPaymentForm && (
        <div className="payment-form">
          <h5>New Payment</h5>
          <div className="form-group">
            <label>Amount (USD):</label>
            <input
              type="number"
              step="0.01"
              min="1.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="form-control"
            />
          </div>
          <div className="form-actions">
            <button
              onClick={createPaymentIntent}
              disabled={processing || !amount || parseFloat(amount) <= 0}
              className="btn btn-success"
            >
              {processing ? 'Processing...' : 'Pay with Stripe'}
            </button>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {payments.length === 0 && !loading && !error && (
        <div className="no-payments">
          <p>No payments found for this case.</p>
        </div>
      )}

      <div className="payments-list">
        {payments.map((payment) => (
          <div key={payment.id} className="payment-card">
            <div className="payment-header">
              <div className="payment-amount">
                ${formatAmount(payment.amount_cents)} {payment.currency.toUpperCase()}
              </div>
              <span 
                className="payment-status"
                style={{ color: getStatusColor(payment.status) }}
              >
                {payment.status.toUpperCase()}
              </span>
            </div>

            <div className="payment-details">
              <p><strong>Payment ID:</strong> {payment.id}</p>
              <p><strong>Created:</strong> {formatDate(payment.created_at)}</p>
              {payment.completed_at && (
                <p><strong>Completed:</strong> {formatDate(payment.completed_at)}</p>
              )}
              {payment.refunded_at && (
                <p><strong>Refunded:</strong> {formatDate(payment.refunded_at)}</p>
              )}
              {payment.description && (
                <p><strong>Description:</strong> {payment.description}</p>
              )}
            </div>

            <div className="payment-actions">
              {payment.status === 'completed' && (
                <button
                  onClick={() => refundPayment(payment.id)}
                  className="btn btn-sm btn-warning"
                >
                  Refund
                </button>
              )}
              {payment.status === 'pending' && (
                <span className="text-muted">Processing payment...</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
