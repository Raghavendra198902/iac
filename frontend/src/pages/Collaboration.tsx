import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Hash, Plus, Search, Send, Smile, Paperclip,
  MoreVertical, Pin, Bell, BellOff, Edit2, Trash2, Reply, Copy,
  CheckCheck, Phone, Video, Settings, User, Circle, AtSign,
  ChevronDown, X, File, Image as ImageIcon, Code, Zap, Star
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import type { Channel, Message, OnlineUser, CollaborationStats, ChannelType, UserStatus } from '../types/collaboration';

export default function Collaboration() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<CollaborationStats>({
    totalMessages: 1247,
    activeUsers: 24,
    channels: 12,
    messagesLast24h: 183
  });
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserPanel, setShowUserPanel] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChannels();
    loadOnlineUsers();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      // Load messages for this channel from storage
      const channelMsgs = channelMessages[selectedChannel.id];
      if (channelMsgs) {
        // Channel has messages, use them
        setMessages(channelMsgs);
      } else {
        // First time loading this channel, load mock messages
        loadMessages(selectedChannel.id);
      }
    }
  }, [selectedChannel]); // Remove channelMessages from dependencies to prevent loop

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChannels = () => {
    const mockChannels: Channel[] = [
      {
        id: '1',
        name: 'general',
        type: 'team',
        description: 'General team discussions',
        members: ['user1', 'user2', 'user3'],
        unreadCount: 3,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'admin',
        isPinned: true,
        lastMessage: {
          id: 'm1',
          channelId: '1',
          userId: 'user1',
          userName: 'Sarah Johnson',
          type: 'text',
          content: 'Great work on the infrastructure deployment!',
          timestamp: '2024-01-20T09:45:00Z'
        }
      },
      {
        id: '2',
        name: 'aws-infrastructure',
        type: 'project',
        description: 'AWS infrastructure discussions',
        members: ['user1', 'user2', 'user4'],
        unreadCount: 7,
        createdAt: '2024-01-16T14:30:00Z',
        createdBy: 'user1',
        lastMessage: {
          id: 'm2',
          channelId: '2',
          userId: 'user2',
          userName: 'Mike Chen',
          type: 'text',
          content: 'Just deployed the new EKS cluster',
          timestamp: '2024-01-20T10:15:00Z'
        }
      },
      {
        id: '3',
        name: 'security-alerts',
        type: 'announcement',
        description: 'Security alerts and updates',
        members: ['user1', 'user2', 'user3', 'user4'],
        unreadCount: 0,
        createdAt: '2024-01-17T08:00:00Z',
        createdBy: 'admin',
        isPinned: true,
        lastMessage: {
          id: 'm3',
          channelId: '3',
          userId: 'admin',
          userName: 'System',
          type: 'system',
          content: 'New security patch available for production',
          timestamp: '2024-01-19T16:00:00Z'
        }
      },
      {
        id: '4',
        name: 'devops-team',
        type: 'team',
        description: 'DevOps team collaboration',
        members: ['user1', 'user3', 'user5'],
        unreadCount: 0,
        createdAt: '2024-01-18T11:00:00Z',
        createdBy: 'user3',
        lastMessage: {
          id: 'm4',
          channelId: '4',
          userId: 'user5',
          userName: 'Emily Davis',
          type: 'text',
          content: 'CI/CD pipeline is running smoothly',
          timestamp: '2024-01-20T08:30:00Z'
        }
      },
      {
        id: '5',
        name: 'cost-optimization',
        type: 'project',
        description: 'Cost optimization strategies',
        members: ['user1', 'user2', 'user6'],
        unreadCount: 2,
        createdAt: '2024-01-19T09:00:00Z',
        createdBy: 'user6',
        lastMessage: {
          id: 'm5',
          channelId: '5',
          userId: 'user6',
          userName: 'James Wilson',
          type: 'text',
          content: 'Found opportunities to save $5k/month',
          timestamp: '2024-01-20T09:00:00Z'
        }
      }
    ];
    setChannels(mockChannels);
    setSelectedChannel(mockChannels[0]);
  };

  const loadOnlineUsers = () => {
    const mockUsers: OnlineUser[] = [
      {
        id: 'user1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        status: 'online',
        statusMessage: 'Working on AWS deployment',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Mike Chen',
        email: 'mike@example.com',
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user3',
        name: 'Emily Davis',
        email: 'emily@example.com',
        status: 'away',
        statusMessage: 'In a meeting',
        lastSeen: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'user4',
        name: 'David Park',
        email: 'david@example.com',
        status: 'busy',
        statusMessage: 'Do not disturb',
        lastSeen: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'user5',
        name: 'Lisa Anderson',
        email: 'lisa@example.com',
        status: 'online',
        lastSeen: new Date().toISOString()
      },
      {
        id: 'user6',
        name: 'James Wilson',
        email: 'james@example.com',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setOnlineUsers(mockUsers);
  };

  const loadStats = () => {
    // Already set in initial state
  };

  const loadMessages = (channelId: string) => {
    const mockMessages: Message[] = [
      {
        id: 'm1',
        channelId: channelId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        type: 'text',
        content: 'Good morning team! Ready to tackle the AWS migration today.',
        timestamp: '2024-01-20T08:00:00Z'
      },
      {
        id: 'm2',
        channelId: channelId,
        userId: 'user2',
        userName: 'Mike Chen',
        type: 'text',
        content: 'Morning! I\'ve prepared the terraform scripts for review.',
        timestamp: '2024-01-20T08:05:00Z',
        reactions: [
          { emoji: '👍', users: ['user1', 'user3'], count: 2 }
        ]
      },
      {
        id: 'm3',
        channelId: channelId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        type: 'code',
        content: `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  
  tags = {
    Name = "WebServer"
    Environment = "production"
  }
}`,
        timestamp: '2024-01-20T08:15:00Z'
      },
      {
        id: 'm4',
        channelId: channelId,
        userId: 'user3',
        userName: 'Emily Davis',
        type: 'text',
        content: '@Sarah Johnson Looks good! Should we add monitoring to this instance?',
        mentions: ['user1'],
        timestamp: '2024-01-20T08:20:00Z'
      },
      {
        id: 'm5',
        channelId: channelId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        type: 'text',
        content: 'Yes, great idea! I\'ll add CloudWatch alarms.',
        timestamp: '2024-01-20T08:25:00Z',
        replyTo: 'm4'
      },
      {
        id: 'm6',
        channelId: channelId,
        userId: 'system',
        userName: 'System',
        type: 'system',
        content: 'Mike Chen uploaded deployment-plan.pdf',
        timestamp: '2024-01-20T08:30:00Z',
        attachments: [
          {
            id: 'a1',
            name: 'deployment-plan.pdf',
            type: 'application/pdf',
            size: 245678,
            url: '/files/deployment-plan.pdf'
          }
        ]
      },
      {
        id: 'm7',
        channelId: channelId,
        userId: 'user4',
        userName: 'David Park',
        type: 'text',
        content: 'Just reviewed the security group rules. All looks secure! 🔒',
        timestamp: '2024-01-20T09:00:00Z',
        reactions: [
          { emoji: '✅', users: ['user1', 'user2', 'user3'], count: 3 },
          { emoji: '🔒', users: ['user1'], count: 1 }
        ]
      },
      {
        id: 'm8',
        channelId: channelId,
        userId: 'user2',
        userName: 'Mike Chen',
        type: 'text',
        content: 'Deployment is progressing smoothly. ETA: 30 minutes',
        timestamp: '2024-01-20T09:30:00Z'
      },
      {
        id: 'm9',
        channelId: channelId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        type: 'text',
        content: 'Great work on the infrastructure deployment! Everything is running perfectly.',
        timestamp: '2024-01-20T09:45:00Z'
      }
    ];
    // Store messages for this channel
    setChannelMessages(prev => ({
      ...prev,
      [channelId]: mockMessages
    }));
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChannel) return;

    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Current User';
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      channelId: selectedChannel.id,
      userId: user?.id || 'current-user',
      userName,
      type: 'text',
      content: messageInput,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', newMessage);
    console.log('Current messages count:', messages.length);
    
    // Get current messages for this channel (or empty array)
    const currentChannelMsgs = channelMessages[selectedChannel.id] || messages;
    const updatedMessages = [...currentChannelMsgs, newMessage];
    
    // Update both states
    setChannelMessages(prev => ({
      ...prev,
      [selectedChannel.id]: updatedMessages
    }));
    setMessages(updatedMessages);
    
    console.log('Updated messages count:', updatedMessages.length);
    setMessageInput('');
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedChannel) {
      const file = files[0];
      const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Current User';
      
      const newMessage: Message = {
        id: `m${Date.now()}`,
        channelId: selectedChannel.id,
        userId: user?.id || 'current-user',
        userName,
        type: 'file',
        content: file.name,
        timestamp: new Date().toISOString(),
        attachments: [{
          id: `a${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        }]
      };
      
      console.log('Sending file:', newMessage);
      console.log('Current messages count:', messages.length);
      
      // Get current messages for this channel (or empty array)
      const currentChannelMsgs = channelMessages[selectedChannel.id] || messages;
      const updatedMessages = [...currentChannelMsgs, newMessage];
      
      // Update both states
      setChannelMessages(prev => ({
        ...prev,
        [selectedChannel.id]: updatedMessages
      }));
      setMessages(updatedMessages);
      
      console.log('Updated messages count:', updatedMessages.length);
      e.target.value = ''; // Reset file input
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleCodeBlock = () => {
    setMessageInput(prev => prev + '```\n\n```');
  };

  const handleMention = () => {
    setMessageInput(prev => prev + '@');
  };

  const handleVoiceCall = () => {
    if (!selectedChannel) return;
    alert(`🎙️ Starting voice call in #${selectedChannel.name}...\n\nVoice call feature will connect to WebRTC service.`);
    console.log('Starting voice call for channel:', selectedChannel.name);
  };

  const handleVideoCall = () => {
    if (!selectedChannel) return;
    alert(`📹 Starting video call in #${selectedChannel.name}...\n\nVideo call feature will connect to WebRTC service.`);
    console.log('Starting video call for channel:', selectedChannel.name);
  };

  const handleChannelSettings = () => {
    if (!selectedChannel) return;
    alert(`⚙️ Channel Settings: #${selectedChannel.name}\n\nMembers: ${selectedChannel.members.length}\nType: ${selectedChannel.type}\nDescription: ${selectedChannel.description || 'No description'}`);
  };

  const commonEmojis = ['😀', '😂', '😊', '👍', '❤️', '🎉', '🔥', '👏', '✅', '💯', '🚀', '💡', '⚡', '🎯', '👀', '🤔', '😎', '🙌', '💪', '⭐'];

  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case 'team':
        return <Users className="w-4 h-4" />;
      case 'project':
        return <Hash className="w-4 h-4" />;
      case 'announcement':
        return <Zap className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(user?.id || 'current-user')) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(u => u !== (user?.id || 'current-user'));
            existingReaction.count--;
            return { ...msg, reactions: reactions.filter(r => r.count > 0) };
          } else {
            // Add reaction
            existingReaction.users.push(user?.id || 'current-user');
            existingReaction.count++;
            return { ...msg, reactions };
          }
        } else {
          // New reaction
          return {
            ...msg,
            reactions: [...reactions, { emoji, users: [user?.id || 'current-user'], count: 1 }]
          };
        }
      }
      return msg;
    }));
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Channels */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Channels</h2>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.activeUsers}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Online</p>
            </div>
            <div>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{stats.messagesLast24h}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Messages 24h</p>
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${
                selectedChannel?.id === channel.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  : 'border-transparent'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                selectedChannel?.id === channel.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
                {getChannelIcon(channel.type)}
              </div>
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white truncate">
                    {channel.name}
                  </span>
                  {channel.isPinned && <Pin className="w-3 h-3 text-gray-400" />}
                  {channel.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                </div>
                {channel.lastMessage && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {channel.lastMessage.userName}: {channel.lastMessage.content}
                  </p>
                )}
              </div>

              {channel.unreadCount > 0 && (
                <Badge variant="blue" className="text-xs px-2">
                  {channel.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  {getChannelIcon(selectedChannel.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {selectedChannel.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedChannel.members.length} members
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleVoiceCall}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Start voice call"
                >
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={handleVideoCall}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Start video call"
                >
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={handleChannelSettings}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Channel settings"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => setShowUserPanel(!showUserPanel)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {console.log('Rendering messages, count:', messages.length)}
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
                const isCurrentUser = message.userId === (user?.id || 'current-user');

                return (
                  <FadeIn key={message.id} delay={index * 50}>
                    <div className={`flex gap-3 group ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                      {/* Avatar */}
                      <div className="w-10 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                            {message.userName.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {message.userName}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        )}

                        {/* Message body */}
                        {message.type === 'code' ? (
                          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-gray-100 font-mono">
                              <code>{message.content}</code>
                            </pre>
                          </div>
                        ) : message.type === 'system' ? (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <p className="text-gray-900 dark:text-gray-100 break-words">
                              {message.content}
                            </p>
                          </div>
                        )}

                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 flex gap-2">
                            {message.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                <File className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                  {attachment.name}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => addReaction(message.id, reaction.emoji)}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {reaction.count}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => addReaction(message.id, '👍')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            <Smile className="w-3 h-3 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                            <Reply className="w-3 h-3 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                            <MoreVertical className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </FadeIn>
                );
              })
              )}
              
              {/* Typing indicator */}
              {typingUsers.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-10" />
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 relative">
                    <button 
                      onClick={handleFileAttachment}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button 
                      onClick={handleCodeBlock}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Insert code block"
                    >
                      <Code className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Add emoji"
                      >
                        <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50">
                          <div className="grid grid-cols-10 gap-1 w-80">
                            {commonEmojis.map((emoji, index) => (
                              <button
                                key={index}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={handleMention}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Mention user"
                    >
                      <AtSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      setIsTyping(e.target.value.length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${selectedChannel.name}`}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={() => {
                    console.log('Send button clicked!');
                    console.log('Message input:', messageInput);
                    console.log('Selected channel:', selectedChannel?.name);
                    handleSendMessage();
                  }}
                  disabled={!messageInput.trim()}
                  className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  title={!messageInput.trim() ? 'Type a message first' : 'Send message'}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Online Users */}
      {showUserPanel && (
        <div className="w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Team Members</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {onlineUsers.filter(u => u.status === 'online').length} online
            </p>
          </div>

          <div className="overflow-y-auto">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white dark:border-gray-800`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    {user.statusMessage ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.statusMessage}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </MainLayout>
  );
}
