import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

export interface WorkflowNotification {
  id: string;
  type: 'step-update' | 'step-completed' | 'progress-update' | 'user-viewing';
  projectId: string;
  stepId?: string;
  stepTitle?: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  progress?: number;
}

export const useWorkflowCollaboration = (projectId: string) => {
  const { socket, isConnected, joinProject, leaveProject, emitStepUpdate, emitStepCompleted, emitProgressChange, emitViewingStep } = useWebSocket();
  const [notifications, setNotifications] = useState<WorkflowNotification[]>([]);
  const [activeUsers, setActiveUsers] = useState<{ [stepId: string]: { userId: string; userName: string; socketId: string }[] }>({});

  useEffect(() => {
    if (projectId && isConnected) {
      // Join project room
      joinProject(projectId);

      return () => {
        // Leave project room on unmount
        leaveProject(projectId);
      };
    }
  }, [projectId, isConnected]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for step update notifications
    const handleStepUpdate = (data: any) => {
      const notification: WorkflowNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'step-update',
        projectId: data.projectId,
        stepId: data.stepId,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: data.timestamp,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 20)); // Keep last 20
    };

    // Listen for step completion notifications
    const handleStepCompleted = (data: any) => {
      const notification: WorkflowNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'step-completed',
        projectId: data.projectId,
        stepId: data.stepId,
        stepTitle: data.stepTitle,
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: data.timestamp,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    };

    // Listen for progress updates
    const handleProgressUpdate = (data: any) => {
      const notification: WorkflowNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'progress-update',
        projectId: data.projectId,
        userId: data.userId,
        userName: data.userName,
        message: `Progress updated to ${data.progress}%`,
        timestamp: data.timestamp,
        progress: data.progress,
      };
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
    };

    // Listen for user presence (who's viewing what)
    const handleUserViewingStep = (data: any) => {
      setActiveUsers((prev) => {
        const stepUsers = prev[data.stepId] || [];
        const existingUser = stepUsers.find((u) => u.socketId === data.socketId);
        
        if (!existingUser) {
          return {
            ...prev,
            [data.stepId]: [...stepUsers, { userId: data.userId, userName: data.userName, socketId: data.socketId }],
          };
        }
        return prev;
      });

      // Remove user after 30 seconds of inactivity
      setTimeout(() => {
        setActiveUsers((prev) => {
          const stepUsers = prev[data.stepId] || [];
          return {
            ...prev,
            [data.stepId]: stepUsers.filter((u) => u.socketId !== data.socketId),
          };
        });
      }, 30000);
    };

    socket.on('step-update-notification', handleStepUpdate);
    socket.on('step-completed-notification', handleStepCompleted);
    socket.on('progress-update-notification', handleProgressUpdate);
    socket.on('user-viewing-step', handleUserViewingStep);

    return () => {
      socket?.off('step-update-notification', handleStepUpdate);
      socket?.off('step-completed-notification', handleStepCompleted);
      socket?.off('progress-update-notification', handleProgressUpdate);
      socket?.off('user-viewing-step', handleUserViewingStep);
    };
  }, [socket]);

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    activeUsers,
    clearNotification,
    clearAllNotifications,
    emitStepUpdate,
    emitStepCompleted,
    emitProgressChange,
    emitViewingStep,
    isConnected,
  };
};
