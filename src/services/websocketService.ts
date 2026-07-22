import { USE_MOCK_WEBSOCKET, WEBSOCKET_URL } from '@/constants/config';
import { ChatMessage, WebSocketStatus } from '@/types/chat';

interface SocketHandlers {
  onMessage: (message: ChatMessage) => void;
  onStatusChange: (status: WebSocketStatus) => void;
  onUserCountChange: (count: number) => void;
}

class FalconWebSocketService {
  private socket: WebSocket | null = null;
  private mockTimers: Array<ReturnType<typeof setTimeout>> = [];
  private handlers: SocketHandlers | null = null;

  connect(handlers: SocketHandlers): void {
    this.disconnect();
    this.handlers = handlers;
    handlers.onStatusChange('connecting');

    if (USE_MOCK_WEBSOCKET) {
      this.connectMock();
      return;
    }

    this.socket = new WebSocket(WEBSOCKET_URL);
    this.socket.onopen = () => handlers.onStatusChange('connected');
    this.socket.onmessage = (event) => {
      try {
        handlers.onMessage(JSON.parse(event.data) as ChatMessage);
      } catch {
        // Ignore malformed frames; production telemetry can report these server-side.
      }
    };
    this.socket.onerror = () => handlers.onStatusChange('reconnecting');
    this.socket.onclose = () => handlers.onStatusChange('disconnected');
  }

  send(text: string, senderId: string, senderName: string): ChatMessage {
    const message: ChatMessage = {
      id: `local-${Date.now()}`,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
      isOwn: true,
    };
    if (!USE_MOCK_WEBSOCKET && this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ ...message, isOwn: undefined }));
    }
    return message;
  }

  disconnect(): void {
    this.mockTimers.forEach(clearTimeout);
    this.mockTimers = [];
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.handlers = null;
  }

  private connectMock(): void {
    const handlers = this.handlers;
    if (!handlers) return;
    this.mockTimers.push(
      setTimeout(() => {
        handlers.onStatusChange('connected');
        handlers.onUserCountChange(7);
      }, 500),
      setTimeout(() => handlers.onMessage(this.mockIncoming('Ananya', 'Radar feed is stable. Tracking VPR502 now.')), 1400),
      setTimeout(() => handlers.onMessage(this.mockIncoming('Vikram', 'Copy. C-17 just crossed the outer radius.')), 3600),
    );
  }

  private mockIncoming(senderName: string, text: string): ChatMessage {
    return {
      id: `mock-${senderName}-${Date.now()}`,
      senderId: senderName.toLowerCase(),
      senderName,
      text,
      timestamp: new Date().toISOString(),
      isOwn: false,
    };
  }
}

export const websocketService = new FalconWebSocketService();
