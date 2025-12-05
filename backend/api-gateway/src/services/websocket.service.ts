import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  id: string;
  name: string;
  email: string;
  room?: string;
}

interface CollaborationEvent {
  type: 'user_joined' | 'user_left' | 'typing' | 'message' | 'blueprint_update' | 'cursor_move';
  user: User;
  data?: any;
  timestamp: string;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private users: Map<string, User> = new Map();
  private roomUsers: Map<string, Set<string>> = new Map();

  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventHandlers();
    console.log('✅ WebSocket service initialized');
  }

  private setupEventHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (user: User) => {
        this.users.set(socket.id, { ...user, id: socket.id });
        socket.emit('authenticated', { socketId: socket.id });
        console.log(`✅ User authenticated: ${user.name} (${socket.id})`);
      });

      // Handle joining rooms (channels, blueprints, etc.)
      socket.on('join_room', (roomId: string) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        socket.join(roomId);
        
        // Track room users
        if (!this.roomUsers.has(roomId)) {
          this.roomUsers.set(roomId, new Set());
        }
        this.roomUsers.get(roomId)?.add(socket.id);

        // Update user's room
        user.room = roomId;
        this.users.set(socket.id, user);

        // Broadcast to room
        const event: CollaborationEvent = {
          type: 'user_joined',
          user,
          timestamp: new Date().toISOString()
        };
        socket.to(roomId).emit('room_event', event);

        // Send current room users
        const roomUsers = this.getRoomUsers(roomId);
        socket.emit('room_users', roomUsers);

        console.log(`👥 User ${user.name} joined room: ${roomId}`);
      });

      // Handle leaving rooms
      socket.on('leave_room', (roomId: string) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        socket.leave(roomId);
        this.roomUsers.get(roomId)?.delete(socket.id);

        const event: CollaborationEvent = {
          type: 'user_left',
          user,
          timestamp: new Date().toISOString()
        };
        socket.to(roomId).emit('room_event', event);

        console.log(`👋 User ${user.name} left room: ${roomId}`);
      });

      // Handle typing indicators
      socket.on('typing', (data: { roomId: string; isTyping: boolean }) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        const event: CollaborationEvent = {
          type: 'typing',
          user,
          data: { isTyping: data.isTyping },
          timestamp: new Date().toISOString()
        };
        socket.to(data.roomId).emit('typing_event', event);
      });

      // Handle real-time messages
      socket.on('send_message', (data: { roomId: string; message: string }) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        const event: CollaborationEvent = {
          type: 'message',
          user,
          data: { message: data.message },
          timestamp: new Date().toISOString()
        };
        this.io?.to(data.roomId).emit('new_message', event);
        console.log(`💬 Message from ${user.name} in ${data.roomId}`);
      });

      // Handle blueprint updates (real-time collaboration)
      socket.on('blueprint_update', (data: { blueprintId: string; changes: any }) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        const event: CollaborationEvent = {
          type: 'blueprint_update',
          user,
          data: data.changes,
          timestamp: new Date().toISOString()
        };
        socket.to(`blueprint-${data.blueprintId}`).emit('blueprint_changed', event);
        console.log(`📝 Blueprint update from ${user.name}`);
      });

      // Handle cursor movements (collaborative editing)
      socket.on('cursor_move', (data: { roomId: string; position: { x: number; y: number } }) => {
        const user = this.users.get(socket.id);
        if (!user) return;

        const event: CollaborationEvent = {
          type: 'cursor_move',
          user,
          data: data.position,
          timestamp: new Date().toISOString()
        };
        socket.to(data.roomId).emit('cursor_moved', event);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const user = this.users.get(socket.id);
        if (user && user.room) {
          const event: CollaborationEvent = {
            type: 'user_left',
            user,
            timestamp: new Date().toISOString()
          };
          socket.to(user.room).emit('room_event', event);
          this.roomUsers.get(user.room)?.delete(socket.id);
        }

        this.users.delete(socket.id);
        console.log(`🔌 Client disconnected: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.io?.emit(event, data);
  }

  // Broadcast to a specific room
  broadcastToRoom(roomId: string, event: string, data: any) {
    this.io?.to(roomId).emit(event, data);
  }

  // Get users in a room
  getRoomUsers(roomId: string): User[] {
    const userIds = this.roomUsers.get(roomId);
    if (!userIds) return [];

    return Array.from(userIds)
      .map(id => this.users.get(id))
      .filter((user): user is User => user !== undefined);
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.users.size;
  }

  // Get all active rooms
  getActiveRooms(): string[] {
    return Array.from(this.roomUsers.keys());
  }

  // Notify specific user
  notifyUser(socketId: string, event: string, data: any) {
    this.io?.to(socketId).emit(event, data);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
