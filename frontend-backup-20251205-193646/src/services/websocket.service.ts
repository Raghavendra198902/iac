import { io, Socket } from 'socket.io-client';
import { API_CONFIG, API_ENDPOINTS } from './api.config';
import { AIAgent } from '../types/ai.types';
import { useGenerationStore } from '../stores/useGenerationStore';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentProjectId: string | null = null;

  connect(projectId: string) {
    if (this.socket?.connected && this.currentProjectId === projectId) {
      console.log('WebSocket already connected to project:', projectId);
      return;
    }

    // Disconnect from previous project if any
    if (this.socket && this.currentProjectId !== projectId) {
      this.disconnect();
    }

    this.currentProjectId = projectId;

    // Create WebSocket connection
    const wsUrl = `${API_CONFIG.WS_BASE_URL}${API_ENDPOINTS.AI_WEBSOCKET}/${projectId}`;
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Send subscription message
      this.socket?.emit('subscribe', { project_id: this.currentProjectId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('agent_status', (data: AIAgent) => {
      console.log('📊 Agent status update:', data);
      useGenerationStore.getState().updateAgent(data.id, data);
    });

    this.socket.on('progress_update', (data: { agentId: string; progress: number }) => {
      console.log('📈 Progress update:', data);
      useGenerationStore.getState().updateAgent(data.agentId, { progress: data.progress });
    });

    this.socket.on('generation_complete', (data: { project_id: string }) => {
      console.log('✅ Generation complete:', data);
      useGenerationStore.getState().setIsGenerating(false);
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('❌ WebSocket error:', error);
      useGenerationStore.getState().setError(error.message);
      useGenerationStore.getState().setIsGenerating(false);
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      console.error(`❌ Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`, error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        useGenerationStore.getState().setError('Failed to connect to server after multiple attempts');
      }
    });

    this.socket.on('subscribed', (data: { project_id: string }) => {
      console.log('✅ Subscribed to project:', data.project_id);
    });

    this.socket.on('pong', () => {
      // Pong response to ping
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('👋 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.currentProjectId = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  sendPing() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

export const websocketService = new WebSocketService();
