import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  emitStepUpdate: (projectId: string, stepId: string, userName: string) => void;
  emitStepCompleted: (projectId: string, stepId: string, stepTitle: string, userName: string) => void;
  emitProgressChange: (projectId: string, progress: number, userName: string) => void;
  emitViewingStep: (projectId: string, stepId: string, userName: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  joinProject: () => {},
  leaveProject: () => {},
  emitStepUpdate: () => {},
  emitStepCompleted: () => {},
  emitProgressChange: () => {},
  emitViewingStep: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinProject = (projectId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-project', projectId);
      console.log(`📥 Joined project room: ${projectId}`);
    }
  };

  const leaveProject = (projectId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-project', projectId);
      console.log(`📤 Left project room: ${projectId}`);
    }
  };

  const emitStepUpdate = (projectId: string, stepId: string, userName: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('step-updated', {
        projectId,
        stepId,
        userId: 'current-user', // Replace with actual user ID
        userName,
      });
      console.log(`🔄 Step update emitted for ${stepId}`);
    }
  };

  const emitStepCompleted = (projectId: string, stepId: string, stepTitle: string, userName: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('step-completed', {
        projectId,
        stepId,
        stepTitle,
        userId: 'current-user',
        userName,
      });
      console.log(`✅ Step completed emitted for ${stepTitle}`);
    }
  };

  const emitProgressChange = (projectId: string, progress: number, userName: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('project-progress-changed', {
        projectId,
        progress,
        userId: 'current-user',
        userName,
      });
      console.log(`📊 Progress change emitted: ${progress}%`);
    }
  };

  const emitViewingStep = (projectId: string, stepId: string, userName: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('viewing-step', {
        projectId,
        stepId,
        userId: 'current-user',
        userName,
      });
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinProject,
    leaveProject,
    emitStepUpdate,
    emitStepCompleted,
    emitProgressChange,
    emitViewingStep,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
