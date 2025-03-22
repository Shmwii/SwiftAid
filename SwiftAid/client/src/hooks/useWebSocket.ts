import { useState, useEffect, useCallback, useRef } from 'react';

// Define basic message types for typechecking
export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// Hook options
interface UseWebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  userId?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoReconnect = true,
    reconnectInterval = 3000,
    onOpen,
    onMessage,
    onError,
    onClose,
    userId = 1 // Default user for demo
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Setup connection
  const connect = useCallback(() => {
    // Use the global connection if available
    if (window.wsConnection && window.wsConnection.readyState === WebSocket.OPEN) {
      socketRef.current = window.wsConnection;
      setIsConnected(true);
      return;
    }

    // Otherwise create a new connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    window.wsConnection = socket;

    socket.onopen = (event) => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setReconnectCount(0);

      // Send auth message
      const authMessage = JSON.stringify({
        type: 'AUTH',
        userId
      });
      socket.send(authMessage);

      // Call custom handler if provided
      if (onOpen) onOpen(event);
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('WebSocket message received:', parsedData);
        setLastMessage(parsedData);
        
        // Call custom handler if provided
        if (onMessage) onMessage(parsedData);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onerror = (event) => {
      console.error('WebSocket error:', event);
      
      // Call custom handler if provided
      if (onError) onError(event);
    };

    socket.onclose = (event) => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Call custom handler if provided
      if (onClose) onClose(event);
      
      // Attempt to reconnect if auto-reconnect is enabled
      if (autoReconnect) {
        const timeout = Math.min(reconnectInterval * (reconnectCount + 1), 30000);
        console.log(`Reconnecting in ${timeout}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectCount(prevCount => prevCount + 1);
          connect();
        }, timeout);
      }
    };
  }, [autoReconnect, reconnectInterval, onOpen, onMessage, onError, onClose, userId, reconnectCount]);

  // Initialize connection
  useEffect(() => {
    connect();

    // Clean up on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Don't close the global connection on unmount, only on complete app shutdown
    };
  }, [connect]);

  // Function to send messages through the WebSocket
  const sendMessage = useCallback((message: WebSocketMessage | string) => {
    const socket = socketRef.current || window.wsConnection;
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      const stringMessage = typeof message === 'string' 
        ? message 
        : JSON.stringify(message);
        
      socket.send(stringMessage);
      return true;
    }
    
    console.warn('WebSocket not connected, message not sent');
    return false;
  }, []);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }
    
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Try to connect again
    connect();
  }, [connect]);

  // Function to manually close the connection
  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      socketRef.current.close();
    }
    
    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  return { 
    isConnected, 
    lastMessage, 
    sendMessage, 
    reconnect, 
    disconnect,
    reconnectCount 
  };
};
