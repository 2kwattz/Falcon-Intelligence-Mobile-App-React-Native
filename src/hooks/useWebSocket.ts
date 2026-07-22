import { useCallback, useEffect, useState } from 'react';
import { websocketService } from '@/services/websocketService';
import { ChatMessage, WebSocketStatus } from '@/types/chat';

export const useWebSocket = (userId: string, userName: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    websocketService.connect({
      onMessage: (message) => setMessages((current) => [...current, message]),
      onStatusChange: setStatus,
      onUserCountChange: setUserCount,
    });
    return () => websocketService.disconnect();
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || status !== 'connected') return false;
      setMessages((current) => [...current, websocketService.send(trimmed, userId, userName)]);
      return true;
    },
    [status, userId, userName],
  );

  const reconnect = useCallback(() => {
    websocketService.connect({
      onMessage: (message) => setMessages((current) => [...current, message]),
      onStatusChange: setStatus,
      onUserCountChange: setUserCount,
    });
  }, []);

  return { messages, status, userCount, send, reconnect };
};
