export type MessageType = 'text' | 'file' | 'code' | 'system' | 'mention';
export type ChannelType = 'team' | 'project' | 'direct' | 'announcement';
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: MessageType;
  content: string;
  mentions?: string[];
  attachments?: Attachment[];
  reactions?: Reaction[];
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  replyTo?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description?: string;
  members: string[];
  unreadCount: number;
  lastMessage?: Message;
  createdAt: string;
  createdBy: string;
  isPinned?: boolean;
  isMuted?: boolean;
}

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: UserStatus;
  statusMessage?: string;
  lastSeen: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  channelId: string;
}

export interface CollaborationStats {
  totalMessages: number;
  activeUsers: number;
  channels: number;
  messagesLast24h: number;
}
