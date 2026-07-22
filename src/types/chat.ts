export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
