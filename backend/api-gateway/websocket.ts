import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import { Server } from 'http';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// WebSocket notification types
export enum NotificationType {
  DEPLOYMENT_STARTED = 'deployment.started',
  DEPLOYMENT_COMPLETED = 'deployment.completed',
  DEPLOYMENT_FAILED = 'deployment.failed',
  BLUEPRINT_CREATED = 'blueprint.created',
  BLUEPRINT_UPDATED = 'blueprint.updated',
  COST_ALERT = 'cost.alert',
  DRIFT_DETECTED = 'drift.detected',
  AI_RECOMMENDATION = 'ai.recommendation',
  SYSTEM_ALERT = 'system.alert',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  data?: any;
  userId?: string;
  tenantId?: string;
}

// Notification event emitter
export const notificationEmitter = new EventEmitter();

// Connected clients map
const clients = new Map<string, WebSocket>();

export function setupWebSocketServer(server: Server): void {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws',
    verifyClient: (info, callback) => {
      // Verify JWT token from query params
      const token = new URL(info.req.url!, `http://${info.req.headers.host}`).searchParams.get('token');
      
      if (!token) {
        callback(false, 401, 'Unauthorized');
        return;
      }
      
      try {
        jwt.verify(token, JWT_SECRET);
        callback(true);
      } catch (error) {
        callback(false, 401, 'Invalid token');
      }
    }
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Unauthorized');
      return;
    }
    
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId;
      
      // Store client connection
      clients.set(userId, ws);
      console.log(`WebSocket client connected: ${userId}`);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to IAC Dharma notifications',
        timestamp: new Date(),
      }));
      
      // Handle client messages
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          handleClientMessage(userId, data, ws);
        } catch (error) {
          console.error('Invalid message format:', error);
        }
      });
      
      // Handle disconnection
      ws.on('close', () => {
        clients.delete(userId);
        console.log(`WebSocket client disconnected: ${userId}`);
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        clients.delete(userId);
      });
      
    } catch (error) {
      console.error('Invalid JWT token:', error);
      ws.close(1008, 'Invalid token');
    }
  });

  // Listen for notification events
  notificationEmitter.on('notification', (notification: Notification) => {
    broadcastNotification(notification);
  });

  console.log('✅ WebSocket server initialized');
}

function handleClientMessage(userId: string, data: any, ws: WebSocket): void {
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
      break;
      
    case 'subscribe':
      // Handle subscription to specific notification types
      console.log(`User ${userId} subscribed to: ${data.topics}`);
      break;
      
    case 'unsubscribe':
      // Handle unsubscription
      console.log(`User ${userId} unsubscribed from: ${data.topics}`);
      break;
      
    default:
      console.log(`Unknown message type: ${data.type}`);
  }
}

function broadcastNotification(notification: Notification): void {
  const message = JSON.stringify(notification);
  
  clients.forEach((ws, userId) => {
    // Filter by user/tenant if specified
    if (notification.userId && notification.userId !== userId) {
      return;
    }
    
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Helper function to send notifications
export function sendNotification(notification: Notification): void {
  notificationEmitter.emit('notification', notification);
}

// Express routes for REST-based notifications
const router = express.Router();

// Get notification history
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    // In production, fetch from database
    const notifications: Notification[] = [
      {
        id: '1',
        type: NotificationType.DEPLOYMENT_COMPLETED,
        title: 'Deployment Completed',
        message: 'Production deployment successful',
        severity: 'success',
        timestamp: new Date(),
        userId,
      },
      {
        id: '2',
        type: NotificationType.COST_ALERT,
        title: 'Cost Alert',
        message: 'Monthly cost exceeded $1000',
        severity: 'warning',
        timestamp: new Date(),
        userId,
      },
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // In production, update database
    console.log(`Marked notification ${id} as read`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Send test notification (admin only)
router.post('/notifications/test', async (req: Request, res: Response) => {
  try {
    const notification: Notification = {
      id: Date.now().toString(),
      type: NotificationType.SYSTEM_ALERT,
      title: 'Test Notification',
      message: 'This is a test notification',
      severity: 'info',
      timestamp: new Date(),
      ...req.body,
    };
    
    sendNotification(notification);
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Failed to send test notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export { router as notificationRoutes };
