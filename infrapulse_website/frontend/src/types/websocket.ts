export type WSEventType =
  | 'complaint.ai_completed'
  | 'complaint.ai_failed'
  | 'queue.updated'
  | 'complaint.status_changed'
  | 'complaint.resolved'
  | 'connection.established'
  | 'error'
  | 'pong';

export interface WebSocketEvent<T = Record<string, unknown>> {
  event_type: WSEventType;
  timestamp?: string;
  data: T;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline';
