'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api-client';

export default function CalendarIntegration({ userRole, userId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [calendarProviders, setCalendarProviders] = useState({
    google: false,
    outlook: false,
    apple: false
  });

  useEffect(() => {
    fetchAppointments();
    fetchCalendarIntegrations();
  }, []);

  async function fetchAppointments() {
    try {
      const endpoint = userRole === 'lawyer' ? '/api/appointments/lawyer' : '/api/appointments';
      const data = await apiGet(endpoint);
      setAppointments(Array.isArray(data) ? data : data.appointments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCalendarIntegrations() {
    try {
      const data = await apiGet('/api/calendar/integrations');
      setCalendarProviders(data.providers || {});
    } catch (err) {
      console.log('No calendar integrations found');
    }
  }

  async function connectCalendar(provider) {
    try {
      const response = await apiPost(`/api/calendar/connect/${provider}`);
      if (response.auth_url) {
        window.open(response.auth_url, '_blank', 'width=500,height=600');
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function disconnectCalendar(provider) {
    try {
      await apiPost(`/api/calendar/disconnect/${provider}`);
      setCalendarProviders(prev => ({ ...prev, [provider]: false }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function syncToCalendar(provider) {
    try {
      await apiPost(`/api/calendar/sync/${provider}`);
      // Show success message
    } catch (err) {
      setError(err.message);
    }
  }

  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }

  function getAppointmentsForDate(date) {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.scheduled_at);
      return aptDate.toDateString() === date.toDateString();
    });
  }

  function navigateMonth(direction) {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  if (loading) return <div className="loading">Loading calendar...</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: 'var(--primary)', margin: 0 }}>Calendar</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setShowIntegrationModal(true)}
            style={{ fontSize: '0.9rem' }}
          >
            📅 Sync Calendar
          </button>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setView('day')}
              style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px',
                backgroundColor: view === 'day' ? 'var(--primary)' : 'transparent',
                color: view === 'day' ? 'white' : 'inherit'
              }}
            >
              Day
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => setView('week')}
              style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px',
                backgroundColor: view === 'week' ? 'var(--primary)' : 'transparent',
                color: view === 'week' ? 'white' : 'inherit'
              }}
            >
              Week
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => setView('month')}
              style={{ 
                fontSize: '0.8rem', 
                padding: '4px 8px',
                backgroundColor: view === 'month' ? 'var(--primary)' : 'transparent',
                color: view === 'month' ? 'white' : 'inherit'
              }}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Calendar Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: 'var(--background)',
        borderRadius: '8px'
      }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigateMonth('prev')}
          style={{ padding: '6px 12px' }}
        >
          ← Previous
        </button>
        <h4 style={{ margin: 0, color: 'var(--primary)' }}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h4>
        <button 
          className="btn btn-outline" 
          onClick={() => navigateMonth('next')}
          style={{ padding: '6px 12px' }}
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      {view === 'month' && (
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          {/* Day Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: 'var(--background)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ 
                padding: '12px', 
                textAlign: 'center', 
                fontWeight: 'bold',
                borderRight: '1px solid var(--border)',
                fontSize: '0.9rem'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {getDaysInMonth(currentDate).map((date, index) => {
              const dayAppointments = date ? getAppointmentsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  style={{
                    minHeight: '100px',
                    padding: '8px',
                    border: '1px solid var(--border)',
                    borderTop: 'none',
                    borderRight: index % 7 !== 6 ? '1px solid var(--border)' : 'none',
                    backgroundColor: isToday ? 'var(--primary)' : date ? 'white' : 'var(--background)',
                    color: isToday ? 'white' : 'inherit'
                  }}
                >
                  {date && (
                    <>
                      <div style={{ 
                        fontWeight: isToday ? 'bold' : 'normal',
                        marginBottom: '4px',
                        fontSize: '0.9rem'
                      }}>
                        {date.getDate()}
                      </div>
                      <div style={{ fontSize: '0.75rem' }}>
                        {dayAppointments.slice(0, 2).map((apt, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              backgroundColor: isToday ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                              color: isToday ? 'white' : 'white',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {formatTime(apt.scheduled_at)} - {apt.client_email || 'Appointment'}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div style={{ fontSize: '0.7rem', color: isToday ? 'rgba(255,255,255,0.8)' : 'var(--text-light)' }}>
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integration Modal */}
      {showIntegrationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowIntegrationModal(false)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Calendar Integration</h3>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowIntegrationModal(false)}
                  style={{ padding: '4px 12px' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>
                  Connect your external calendar to sync appointments automatically.
                </p>

                {/* Google Calendar */}
                <div style={{ 
                  padding: '16px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.5rem' }}>📅</div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Google Calendar</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {calendarProviders.google ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  {calendarProviders.google ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => syncToCalendar('google')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Sync Now
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => disconnectCalendar('google')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => connectCalendar('google')}
                      style={{ fontSize: '0.85rem' }}
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Outlook Calendar */}
                <div style={{ 
                  padding: '16px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.5rem' }}>🔷</div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Outlook Calendar</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {calendarProviders.outlook ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  {calendarProviders.outlook ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => syncToCalendar('outlook')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Sync Now
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => disconnectCalendar('outlook')}
                        style={{ fontSize: '0.85rem' }}
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => connectCalendar('outlook')}
                      style={{ fontSize: '0.85rem' }}
                    >
                      Connect
                    </button>
                  )}
                </div>

                {/* Apple Calendar (Info only) */}
                <div style={{ 
                  padding: '16px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '8px',
                  backgroundColor: 'var(--background)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.5rem' }}>🍎</div>
                    <div>
                      <div style={{ fontWeight: '500' }}>Apple Calendar</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        Export calendar events and import manually into Apple Calendar
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: 'var(--background)', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: 'var(--text-light)'
              }}>
                <p><strong>Note:</strong> Calendar integration allows two-way sync of appointments. You can control sync frequency and which events are shared in settings.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
