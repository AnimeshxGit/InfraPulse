import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { WebSocketEvent, ConnectionStatus } from '../types/websocket';
import { API_BASE_URL } from '../api/client';

export interface UseRealtimeReturn {
  status: ConnectionStatus;
  lastEvent: WebSocketEvent | null;
  sendMessage: (msg: Record<string, unknown>) => void;
}

export function useRealtime(): UseRealtimeReturn {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>('offline');
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  const connectRef = useRef<() => void>(() => {});

  const handleEvent = useCallback((event: WebSocketEvent) => {
    setLastEvent(event);
    const { event_type, data } = event;

    switch (event_type) {
      case 'complaint.ai_completed': {
        const complaintId = data.complaint_id as string;
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
        if (complaintId) {
          queryClient.invalidateQueries({ queryKey: ['complaints', 'detail', complaintId] });
          queryClient.invalidateQueries({ queryKey: ['complaints', 'position', complaintId] });
        }
        queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        break;
      }
      case 'complaint.ai_failed': {
        const complaintId = data.complaint_id as string;
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
        if (complaintId) {
          queryClient.invalidateQueries({ queryKey: ['complaints', 'detail', complaintId] });
        }
        break;
      }
      case 'queue.updated': {
        queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
        queryClient.invalidateQueries({ queryKey: ['complaints', 'position'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        break;
      }
      case 'complaint.status_changed': {
        const complaintId = data.complaint_id as string;
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
        if (complaintId) {
          queryClient.invalidateQueries({ queryKey: ['complaints', 'detail', complaintId] });
          queryClient.invalidateQueries({ queryKey: ['complaints', 'events', complaintId] });
          queryClient.invalidateQueries({ queryKey: ['complaints', 'position', complaintId] });
        }
        queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
        queryClient.invalidateQueries({ queryKey: ['staff', 'history'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        break;
      }
      case 'complaint.resolved': {
        const complaintId = data.complaint_id as string;
        queryClient.invalidateQueries({ queryKey: ['complaints'] });
        if (complaintId) {
          queryClient.invalidateQueries({ queryKey: ['complaints', 'detail', complaintId] });
          queryClient.invalidateQueries({ queryKey: ['complaints', 'events', complaintId] });
          queryClient.invalidateQueries({ queryKey: ['complaints', 'position', complaintId] });
        }
        queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
        queryClient.invalidateQueries({ queryKey: ['staff', 'history'] });
        queryClient.invalidateQueries({ queryKey: ['stats'] });
        break;
      }
      case 'connection.established': {
        setStatus('connected');
        break;
      }
      default:
        break;
    }
  }, [queryClient]);

  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      setStatus('offline');
      return;
    }

    // Determine WS protocol and URL
    const apiUrl = API_BASE_URL;
    const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';

    const host = apiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${host}/ws?token=${encodeURIComponent(token)}`;

    setStatus((prev) => (prev === 'offline' ? 'connecting' : 'reconnecting'));

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setStatus('connected');
        reconnectAttemptsRef.current = 0;

        // Start ping interval
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event_type || parsed.type) {
            handleEvent(parsed as WebSocketEvent);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        setStatus('reconnecting');

        // Exponential backoff capped at 10s
        const attempts = reconnectAttemptsRef.current;
        const delay = Math.min(1000 * Math.pow(1.5, attempts), 10000);
        reconnectAttemptsRef.current += 1;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = window.setTimeout(() => {
          if (isMountedRef.current && isAuthenticated) {
            connectRef.current();
          }
        }, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      setStatus('offline');
    }
  }, [isAuthenticated, token, handleEvent]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    if (isAuthenticated && token) {
      connect();
    } else {
      setStatus('offline');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    }

    return () => {
      isMountedRef.current = false;
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, token, connect]);

  const sendMessage = useCallback((msg: Record<string, unknown>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return {
    status,
    lastEvent,
    sendMessage,
  };
}
