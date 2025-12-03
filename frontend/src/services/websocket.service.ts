import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from './api.config';
import { AIAgent, WSMessage } from '../types/ai.types';
import { useGenerationStore } from '../stores/useGenerationStore';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect() {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(API_CONFIG.WS_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('agent_status', (data: AIAgent) => {
      useGenerationStore.getState().updateAgent(data.id, data);
    });

    this.socket.on('progress_update', (data: { agentId: string; progress: number }) => {
      useGenerationStore.getState().updateAgent(data.agentId, { progress: data.progress });
    });

    this.socket.on('generation_complete', () => {
      useGenerationStore.getState().setIsGenerating(false);
    });

    this.socket.on('error', (error: { message: string }) => {
      useGenerationStore.getState().setError(error.message);
      useGenerationStore.getState().setIsGenerating(false);
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;
      console.error(`WebSocket connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    });
  }

  joinProjectRoom(projectId: string) {
    if (!this.socket?.connected) {
      console.error('Cannot join room: WebSocket not connected');
      return;
    }
    this.socket.emit('join_project', { projectId });
  }

  leaveProjectRoom(projectId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_project', { projectId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
