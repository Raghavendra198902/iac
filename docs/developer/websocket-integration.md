# WebSocket Integration Guide

## Overview

The IAC Platform WebSocket service enables real-time, bidirectional communication between clients and the server. This is essential for collaborative features, live updates, notifications, and interactive experiences.

**WebSocket URL:** `wss://api.iac-platform.com/ws`  
**Protocol:** Socket.IO 4.x  
**Fallback:** Long polling (automatic)

---

## Getting Started

### Installation

#### JavaScript/TypeScript

```bash
npm install socket.io-client
```

```javascript
import { io } from 'socket.io-client';

const socket = io('wss://api.iac-platform.com', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  },
  transports: ['websocket', 'polling']
});
```

#### Python

```bash
pip install python-socketio
```

```python
import socketio

sio = socketio.Client()
sio.connect('wss://api.iac-platform.com', 
            auth={'token': 'YOUR_JWT_TOKEN'})
```

#### .NET

```bash
dotnet add package SocketIOClient
```

```csharp
using SocketIOClient;

var socket = new SocketIO("wss://api.iac-platform.com");
socket.ConnectAsync();
```

---

## Authentication

All WebSocket connections require authentication.

### Token-Based Authentication

```javascript
const socket = io('wss://api.iac-platform.com', {
  auth: {
    token: jwtToken
  }
});

socket.on('connect_error', (error) => {
  if (error.message === 'Authentication failed') {
    // Refresh token and reconnect
    refreshToken().then(newToken => {
      socket.auth = { token: newToken };
      socket.connect();
    });
  }
});
```

### Session-Based Authentication

```javascript
const socket = io('wss://api.iac-platform.com', {
  withCredentials: true
});
```

---

## Events

### Connection Events

#### connect
Emitted when connection is established.

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
  console.log('Socket ID:', socket.id);
});
```

#### disconnect
Emitted when connection is lost.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  
  if (reason === 'io server disconnect') {
    // Server forcefully disconnected, reconnect manually
    socket.connect();
  }
  // Auto-reconnect for other reasons
});
```

#### connect_error
Emitted when connection fails.

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

### Room Management

#### join_room
Join a room for collaborative features.

```javascript
// Join a room
socket.emit('join_room', {
  roomId: 'blueprint-123',
  userId: 'user-456',
  userName: 'John Doe'
});

// Listen for confirmation
socket.on('room_joined', (data) => {
  console.log('Joined room:', data.roomId);
  console.log('Active users:', data.users);
});
```

#### leave_room
Leave a room.

```javascript
socket.emit('leave_room', {
  roomId: 'blueprint-123'
});

socket.on('room_left', (data) => {
  console.log('Left room:', data.roomId);
});
```

---

### User Events

#### user_joined
Emitted when a user joins a room.

```javascript
socket.on('user_joined', (data) => {
  console.log(`${data.userName} joined the room`);
  // Update UI to show new user
  addUserToList(data);
});
```

**Data Structure:**
```typescript
{
  userId: string;
  userName: string;
  roomId: string;
  timestamp: number;
}
```

#### user_left
Emitted when a user leaves a room.

```javascript
socket.on('user_left', (data) => {
  console.log(`${data.userName} left the room`);
  // Update UI to remove user
  removeUserFromList(data.userId);
});
```

---

### Messaging Events

#### send_message
Send a message to a room.

```javascript
socket.emit('send_message', {
  roomId: 'blueprint-123',
  message: 'Updated the security section',
  type: 'comment' // 'comment', 'system', 'notification'
});
```

#### message
Receive messages from the room.

```javascript
socket.on('message', (data) => {
  console.log(`${data.userName}: ${data.message}`);
  displayMessage(data);
});
```

**Message Data:**
```typescript
{
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  message: string;
  type: 'comment' | 'system' | 'notification';
  timestamp: number;
  metadata?: Record<string, any>;
}
```

---

### Typing Indicators

#### typing
Indicate that a user is typing.

```javascript
// User starts typing
socket.emit('typing', {
  roomId: 'blueprint-123',
  isTyping: true
});

// User stops typing
socket.emit('typing', {
  roomId: 'blueprint-123',
  isTyping: false
});
```

#### user_typing
Receive typing indicators from other users.

```javascript
socket.on('user_typing', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.userName);
  } else {
    hideTypingIndicator(data.userName);
  }
});
```

**Best Practice:** Use debouncing to avoid excessive events.

```javascript
let typingTimeout;

textInput.addEventListener('input', () => {
  socket.emit('typing', { roomId, isTyping: true });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit('typing', { roomId, isTyping: false });
  }, 1000);
});
```

---

### Collaboration Events

#### blueprint_update
Real-time blueprint updates.

```javascript
// Send update
socket.emit('blueprint_update', {
  roomId: 'blueprint-123',
  blueprintId: 'bp-789',
  changes: {
    section: 'security',
    action: 'update',
    content: '...'
  }
});

// Receive updates
socket.on('blueprint_update', (data) => {
  // Apply changes to local blueprint
  applyBlueprintChanges(data.changes);
});
```

**Update Types:**
- `update`: Content modification
- `add`: New section/component added
- `delete`: Section/component removed
- `move`: Reordering of elements

#### cursor_move
Real-time cursor positions (for collaborative editing).

```javascript
// Send cursor position
socket.emit('cursor_move', {
  roomId: 'blueprint-123',
  position: { x: 150, y: 300 },
  selection: { start: 10, end: 25 }
});

// Receive cursor positions
socket.on('cursor_move', (data) => {
  updateRemoteCursor(data.userId, data.position);
  highlightSelection(data.userId, data.selection);
});
```

**Optimization:** Throttle cursor events to max 10/second.

```javascript
import { throttle } from 'lodash';

const sendCursorPosition = throttle((position) => {
  socket.emit('cursor_move', { roomId, position });
}, 100); // Max 10 times per second
```

---

### Notification Events

#### notification
Receive real-time notifications.

```javascript
socket.on('notification', (data) => {
  showNotification({
    title: data.title,
    message: data.message,
    type: data.type, // 'info', 'success', 'warning', 'error'
    action: data.action // Optional action to perform
  });
});
```

**Notification Types:**
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    url: string;
  };
  timestamp: number;
  read: boolean;
}
```

---

## Advanced Usage

### Room Presence

Track active users in a room.

```javascript
class RoomPresence {
  constructor(socket, roomId) {
    this.socket = socket;
    this.roomId = roomId;
    this.users = new Map();
    
    this.socket.on('user_joined', this.handleUserJoined.bind(this));
    this.socket.on('user_left', this.handleUserLeft.bind(this));
  }
  
  handleUserJoined(data) {
    this.users.set(data.userId, data);
    this.onPresenceUpdate();
  }
  
  handleUserLeft(data) {
    this.users.delete(data.userId);
    this.onPresenceUpdate();
  }
  
  getActiveUsers() {
    return Array.from(this.users.values());
  }
  
  getUserCount() {
    return this.users.size;
  }
  
  onPresenceUpdate() {
    // Override this method
  }
}

// Usage
const presence = new RoomPresence(socket, 'blueprint-123');
presence.onPresenceUpdate = () => {
  updateUserList(presence.getActiveUsers());
  updateUserCount(presence.getUserCount());
};
```

---

### Operational Transform (OT)

For conflict-free collaborative editing.

```javascript
class CollaborativeEditor {
  constructor(socket, roomId, documentId) {
    this.socket = socket;
    this.roomId = roomId;
    this.documentId = documentId;
    this.version = 0;
    this.pendingOps = [];
    
    this.socket.on('operation', this.handleOperation.bind(this));
  }
  
  applyLocalOperation(op) {
    // Apply locally
    this.applyOperation(op);
    
    // Send to server
    this.socket.emit('operation', {
      roomId: this.roomId,
      documentId: this.documentId,
      operation: op,
      version: this.version
    });
    
    this.pendingOps.push(op);
  }
  
  handleOperation(data) {
    // Transform against pending operations
    let transformedOp = data.operation;
    for (const pending of this.pendingOps) {
      transformedOp = this.transform(transformedOp, pending);
    }
    
    // Apply transformed operation
    this.applyOperation(transformedOp);
    this.version = data.version;
  }
  
  transform(op1, op2) {
    // Operational Transform logic
    // See: https://operational-transformation.github.io/
  }
  
  applyOperation(op) {
    // Apply operation to document
  }
}
```

---

### Heartbeat & Reconnection

Maintain stable connections.

```javascript
class WebSocketManager {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
      ...options
    };
    
    this.socket = null;
    this.reconnectAttempts = 0;
    this.heartbeatInterval = null;
    
    this.connect();
  }
  
  connect() {
    this.socket = io(this.url, this.options);
    
    this.socket.on('connect', () => {
      console.log('Connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected');
      this.stopHeartbeat();
    });
    
    this.socket.on('pong', () => {
      this.lastPong = Date.now();
    });
  }
  
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastPong = Date.now() - (this.lastPong || Date.now());
      
      if (timeSinceLastPong > 30000) {
        console.warn('Heartbeat timeout, reconnecting...');
        this.socket.disconnect();
        this.connect();
      } else {
        this.socket.emit('ping');
      }
    }, 10000); // Check every 10 seconds
  }
  
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

---

## Error Handling

### Connection Errors

```javascript
socket.on('connect_error', (error) => {
  switch (error.message) {
    case 'Authentication failed':
      // Token expired or invalid
      handleAuthError();
      break;
    
    case 'xhr poll error':
      // Network issue
      showNetworkError();
      break;
    
    case 'timeout':
      // Connection timeout
      retryConnection();
      break;
    
    default:
      console.error('Connection error:', error);
  }
});
```

### Event Errors

```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  // Display user-friendly error
  showErrorNotification({
    title: 'Connection Error',
    message: 'Unable to establish real-time connection. Some features may be unavailable.',
    type: 'warning'
  });
});
```

### Timeout Handling

```javascript
function emitWithTimeout(event, data, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Event timeout'));
    }, timeout);
    
    socket.emit(event, data, (response) => {
      clearTimeout(timer);
      resolve(response);
    });
  });
}

// Usage
try {
  const response = await emitWithTimeout('join_room', { roomId });
  console.log('Joined room:', response);
} catch (error) {
  console.error('Failed to join room:', error);
}
```

---

## Performance Optimization

### Event Throttling

```javascript
import { throttle } from 'lodash';

// Throttle cursor updates
const sendCursorUpdate = throttle((position) => {
  socket.emit('cursor_move', { roomId, position });
}, 100);

// Throttle scroll position updates
const sendScrollUpdate = throttle((scrollPos) => {
  socket.emit('scroll_position', { roomId, scrollPos });
}, 200);
```

### Event Batching

```javascript
class EventBatcher {
  constructor(socket, event, interval = 1000) {
    this.socket = socket;
    this.event = event;
    this.interval = interval;
    this.queue = [];
    this.timer = null;
  }
  
  add(data) {
    this.queue.push(data);
    
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.interval);
    }
  }
  
  flush() {
    if (this.queue.length > 0) {
      this.socket.emit(this.event, this.queue);
      this.queue = [];
    }
    this.timer = null;
  }
}

// Usage
const analyticsBatcher = new EventBatcher(socket, 'analytics_events', 5000);
analyticsBatcher.add({ type: 'page_view', page: '/dashboard' });
analyticsBatcher.add({ type: 'button_click', button: 'export' });
```

### Connection Pooling

For applications with multiple rooms:

```javascript
class SocketPool {
  constructor(baseUrl, maxSockets = 5) {
    this.baseUrl = baseUrl;
    this.maxSockets = maxSockets;
    this.sockets = [];
    this.roomToSocket = new Map();
  }
  
  getSocketForRoom(roomId) {
    if (this.roomToSocket.has(roomId)) {
      return this.roomToSocket.get(roomId);
    }
    
    // Find socket with least rooms
    let socket = this.sockets.reduce((min, s) => 
      s.rooms.size < min.rooms.size ? s : min
    , this.sockets[0] || this.createSocket());
    
    socket.rooms.add(roomId);
    this.roomToSocket.set(roomId, socket);
    
    return socket;
  }
  
  createSocket() {
    if (this.sockets.length >= this.maxSockets) {
      throw new Error('Maximum socket pool size reached');
    }
    
    const socket = io(this.baseUrl);
    socket.rooms = new Set();
    this.sockets.push(socket);
    
    return socket;
  }
}
```

---

## Security Best Practices

1. **Always use WSS** (WebSocket Secure) in production
2. **Validate all incoming data** on both client and server
3. **Implement rate limiting** to prevent abuse
4. **Use room-based permissions** to control access
5. **Sanitize messages** to prevent XSS attacks
6. **Rotate tokens** periodically for long-lived connections
7. **Log suspicious activity** for security monitoring
8. **Implement CORS** properly on the server
9. **Use message signing** for critical operations
10. **Monitor connection patterns** for DDoS attempts

---

## Testing

### Unit Testing (Jest)

```javascript
import { io } from 'socket.io-client';
import { createServer } from 'http';
import { Server } from 'socket.io';

describe('WebSocket Integration', () => {
  let ioServer, serverSocket, clientSocket;
  
  beforeAll((done) => {
    const httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = io(`http://localhost:${port}`);
      ioServer.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });
  
  afterAll(() => {
    ioServer.close();
    clientSocket.close();
  });
  
  test('should join room', (done) => {
    clientSocket.emit('join_room', { roomId: 'test-room' });
    serverSocket.on('join_room', (data) => {
      expect(data.roomId).toBe('test-room');
      done();
    });
  });
});
```

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot establish connection

**Solutions**:
1. Check WebSocket URL is correct
2. Verify authentication token is valid
3. Ensure firewall allows WebSocket connections
4. Try disabling browser extensions
5. Check server logs for errors

### Message Not Received

**Problem**: Events not being received

**Solutions**:
1. Verify event listener is registered before connection
2. Check room membership
3. Confirm user has permissions
4. Inspect network tab for dropped packets
5. Enable debug mode: `socket.io({ debug: true })`

### High Latency

**Problem**: Slow message delivery

**Solutions**:
1. Check network conditions
2. Reduce message frequency (throttle/batch)
3. Use binary data instead of JSON when possible
4. Enable compression
5. Consider geographic server placement

---

## Support

For WebSocket integration support:

- **Documentation**: https://docs.iac-platform.com/websocket
- **API Reference**: https://api-docs.iac-platform.com
- **GitHub Issues**: https://github.com/iac-platform/websocket/issues
- **Email**: websocket-support@iac-platform.com
- **Discord**: https://discord.gg/iac-platform
