'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

export function useWebSocket() {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  const connect = useCallback(() => {
    if (!user || socket?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'}/ws?token=${localStorage.getItem('token')}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnected(false);
        setSocket(null);

        // Attempt reconnection if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError('Failed to connect');
    }
  }, [user, socket]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socket) {
      socket.close(1000, 'User disconnected');
      setSocket(null);
      setConnected(false);
    }
  }, [socket]);

  const sendMessage = useCallback((type, data) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, ...data }));
      return true;
    }
    return false;
  }, [socket]);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'notification':
        // Trigger notification update
        window.dispatchEvent(new CustomEvent('websocket:notification', { detail: data }));
        break;
      case 'case_update':
        window.dispatchEvent(new CustomEvent('websocket:case_update', { detail: data }));
        break;
      case 'appointment_update':
        window.dispatchEvent(new CustomEvent('websocket:appointment_update', { detail: data }));
        break;
      case 'comment_added':
        window.dispatchEvent(new CustomEvent('websocket:comment_added', { detail: data }));
        break;
      case 'ai_suggestion_ready':
        window.dispatchEvent(new CustomEvent('websocket:ai_suggestion_ready', { detail: data }));
        break;
      case 'payment_status':
        window.dispatchEvent(new CustomEvent('websocket:payment_status', { detail: data }));
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }, []);

  // Subscribe to specific channels
  const subscribe = useCallback((channel) => {
    return sendMessage('subscribe', { channel });
  }, [sendMessage]);

  const unsubscribe = useCallback((channel) => {
    return sendMessage('unsubscribe', { channel });
  }, [sendMessage]);

  // Auto-connect when user is available
  useEffect(() => {
    if (user && !socket) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    connected,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe
  };
}

// Hook for listening to WebSocket events
export function useWebSocketListener(eventType, callback) {
  useEffect(() => {
    const handler = (event) => {
      callback(event.detail);
    };

    window.addEventListener(`websocket:${eventType}`, handler);
    
    return () => {
      window.removeEventListener(`websocket:${eventType}`, handler);
    };
  }, [eventType, callback]);
}
