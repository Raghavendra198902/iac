import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Users, Hash, Plus, Search, Send, Smile, Paperclip,
  MoreVertical, Pin, Bell, BellOff, Edit2, Trash2, Reply, Copy,
  CheckCheck, Phone, Video, Settings, User, Circle, AtSign,
  ChevronDown, X, File, Image as ImageIcon, Code, Zap, Star,
  Sparkles, Brain, TrendingUp, Activity, Clock, Rocket, Shield,
  Globe, Wifi, WifiOff, Mic, MicOff, Camera, CameraOff, ScreenShare,
  MessageCircle, Heart, Laugh, ThumbsUp, Gift, Crown, Filter
} from 'lucide-react';
import { MainLayout } from '../components/layout';
import { useAuth } from '../contexts/AuthContext';
import FadeIn from '../components/ui/FadeIn';
import Badge from '../components/ui/Badge';
import { API_URL } from '../config/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { Channel, Message, OnlineUser, CollaborationStats, ChannelType, UserStatus } from '../types/collaboration';

export default function Collaboration() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [stats, setStats] = useState<CollaborationStats>({
    totalMessages: 0,
    activeUsers: 0,
    channels: 0,
    messagesLast24h: 0
  });
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserPanel, setShowUserPanel] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [activeCall, setActiveCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadChannels();
    loadOnlineUsers();
    loadStats();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const url = `${API_URL}/collaboration/channels`;
      console.log('Fetching channels from:', url);
      const response = await fetch(url);
      console.log('Channels response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Channels error response:', errorText);
        throw new Error(`Failed to fetch channels: ${response.status}`);
      }
      const data = await response.json();
      console.log('Channels loaded:', data.length);
      setChannels(data);
      if (data.length > 0) {
        setSelectedChannel(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading channels:', error);
      
      // Set default Dharma IaC project channels
      const defaultChannels: Channel[] = [
        { id: '1', name: 'general', type: 'public', description: 'General team discussions', unreadCount: 0, members: 156, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '2', name: 'infrastructure', type: 'public', description: 'Infrastructure discussions and updates', unreadCount: 3, members: 89, isPrivate: false, isPinned: true, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '3', name: 'deployments', type: 'public', description: 'Deployment notifications and coordination', unreadCount: 7, members: 124, isPrivate: false, isPinned: true, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '4', name: 'cloud-services', type: 'public', description: 'Cloud provider integrations', unreadCount: 0, members: 78, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '5', name: 'terraform', type: 'public', description: 'Terraform configurations and modules', unreadCount: 2, members: 92, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '6', name: 'kubernetes', type: 'public', description: 'K8s orchestration and configs', unreadCount: 5, members: 103, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '7', name: 'security', type: 'private', description: 'Security and compliance', unreadCount: 1, members: 45, isPrivate: true, isPinned: true, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '8', name: 'monitoring', type: 'public', description: 'System monitoring and alerts', unreadCount: 12, members: 87, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '9', name: 'ai-recommendations', type: 'public', description: 'AI-powered optimization suggestions', unreadCount: 4, members: 67, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '10', name: 'random', type: 'public', description: 'Off-topic and team bonding', unreadCount: 0, members: 142, isPrivate: false, isPinned: false, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '11', name: 'ai-bot', type: 'public', description: '🤖 Chat with AI Assistant for help and insights', unreadCount: 0, members: 234, isPrivate: false, isPinned: true, isMuted: false, lastActivity: new Date().toISOString() },
        { id: '12', name: 'application-help', type: 'public', description: '❓ Get help with using the Dharma IaC platform', unreadCount: 2, members: 198, isPrivate: false, isPinned: true, isMuted: false, lastActivity: new Date().toISOString() },
      ];
      
      setChannels(defaultChannels);
      setSelectedChannel(defaultChannels[0]);
      toast.success('Using default Dharma IaC channels');
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/collaboration/users/online`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setOnlineUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      
      // Set default online users
      const defaultUsers: OnlineUser[] = [
        { id: 'bot-ai', name: '🤖 AI Bot', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: 'bot-help', name: '❓ Application Help', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '1', name: 'Yudhishthira', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '2', name: 'Arjuna', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '3', name: 'Krishna', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '4', name: 'Bhima', avatar: '', status: 'away' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '5', name: 'Nakula', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '6', name: 'Sahadeva', avatar: '', status: 'busy' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '7', name: 'Draupadi', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
        { id: '8', name: 'Vidura', avatar: '', status: 'online' as UserStatus, lastSeen: new Date().toISOString() },
      ];
      
      setOnlineUsers(defaultUsers);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/collaboration/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats({
        totalMessages: parseInt(data.total_messages) || 0,
        activeUsers: parseInt(data.active_users) || 0,
        channels: parseInt(data.channels) || 0,
        messagesLast24h: parseInt(data.messages_last_24h) || 0
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      
      // Set default stats
      setStats({
        totalMessages: 3124,
        activeUsers: 10,
        channels: 12,
        messagesLast24h: 189
      });
    }
  };

  const loadMessages = async (channelId: string) => {
    try {
      const url = `${API_URL}/collaboration/channels/${channelId}/messages`;
      console.log('Fetching messages from:', url);
      const response = await fetch(url);
      console.log('Messages response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Messages error response:', errorText);
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      const data = await response.json();
      console.log('Messages loaded:', data.length);
      
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: data
      }));
      setMessages(data);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      
      // Set default welcome messages
      const channelName = channels.find(c => c.id === channelId)?.name || 'general';
      
      let defaultMessages: Message[] = [];
      
      // Special messages for AI Bot channel
      if (channelName === 'ai-bot') {
        defaultMessages = [
          {
            id: '1',
            channelId,
            userId: 'bot-ai',
            userName: '🤖 AI Bot',
            userAvatar: '',
            type: 'text',
            content: 'Hello! I\'m your AI Assistant. I can help you with:\n\n🔹 Infrastructure optimization\n🔹 Terraform best practices\n🔹 Cloud cost analysis\n🔹 Deployment troubleshooting\n🔹 Security recommendations\n\nJust ask me anything!',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            reactions: [{ emoji: '🤖', count: 8, userIds: ['1', '2', '3', '5', '6', '7', '8', 'bot-help'] }],
            isEdited: false,
            isPinned: true
          },
          {
            id: '2',
            channelId,
            userId: '3',
            userName: 'Krishna',
            userAvatar: '',
            type: 'text',
            content: 'This AI bot is incredibly helpful! Saved us hours on our last deployment.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            reactions: [{ emoji: '💯', count: 4, userIds: ['1', '2', '5', '7'] }],
            isEdited: false,
            isPinned: false
          },
          {
            id: '3',
            channelId,
            userId: 'bot-ai',
            userName: '🤖 AI Bot',
            userAvatar: '',
            type: 'text',
            content: '✨ I\'m constantly learning from your infrastructure patterns to provide better recommendations. Feel free to ask about anything related to your Dharma IaC platform!',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            reactions: [{ emoji: '✨', count: 6, userIds: ['1', '2', '3', '5', '7', '8'] }],
            isEdited: false,
            isPinned: false
          }
        ];
      }
      // Special messages for Application Help channel
      else if (channelName === 'application-help') {
        defaultMessages = [
          {
            id: '1',
            channelId,
            userId: 'bot-help',
            userName: '❓ Application Help',
            userAvatar: '',
            type: 'text',
            content: 'Welcome to Application Help! 👋\n\nI can assist you with:\n\n📚 How to use Dharma IaC features\n🎯 Navigation and workflows\n⚙️ Configuration settings\n🔧 Troubleshooting common issues\n📖 Documentation links\n\nWhat do you need help with today?',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            reactions: [{ emoji: '👍', count: 12, userIds: ['1', '2', '3', '4', '5', '6', '7', '8', 'bot-ai', '9', '10', '11'] }],
            isEdited: false,
            isPinned: true
          },
          {
            id: '2',
            channelId,
            userId: '1',
            userName: 'Yudhishthira',
            userAvatar: '',
            type: 'text',
            content: 'Quick question - how do I export my infrastructure blueprint?',
            timestamp: new Date(Date.now() - 3000000).toISOString(),
            reactions: [],
            isEdited: false,
            isPinned: false
          },
          {
            id: '3',
            channelId,
            userId: 'bot-help',
            userName: '❓ Application Help',
            userAvatar: '',
            type: 'text',
            content: 'Great question! To export your blueprint:\n\n1. Go to Enterprise Architecture (Krishna) from the sidebar\n2. Select your blueprint\n3. Click the Export button (download icon)\n4. Choose your format: Terraform, CloudFormation, or ARM templates\n\nYou can also use the CLI: `dharma-iac export --blueprint <name> --format terraform`',
            timestamp: new Date(Date.now() - 2400000).toISOString(),
            reactions: [{ emoji: '🎯', count: 5, userIds: ['1', '2', '3', '5', '7'] }],
            isEdited: false,
            isPinned: false
          },
          {
            id: '4',
            channelId,
            userId: '1',
            userName: 'Yudhishthira',
            userAvatar: '',
            type: 'text',
            content: 'Perfect! That worked. Thanks! 🙏',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            reactions: [{ emoji: '✅', count: 2, userIds: ['bot-help', '3'] }],
            isEdited: false,
            isPinned: false
          }
        ];
      }
      // Default messages for other channels
      else {
        defaultMessages = [
          {
            id: '1',
            channelId,
            userId: '3',
            userName: 'Krishna',
            userAvatar: '',
            type: 'text',
            content: `Welcome to the #${channelName} channel! 🎉 This is where the Dharma IaC team collaborates.`,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            reactions: [{ emoji: '👍', count: 5, userIds: ['1', '2', '4', '5', '6'] }],
            isEdited: false,
            isPinned: false
          },
          {
            id: '2',
            channelId,
            userId: '1',
            userName: 'Yudhishthira',
            userAvatar: '',
            type: 'text',
            content: 'Great to see everyone here! Let\'s build amazing infrastructure together.',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            reactions: [{ emoji: '🎉', count: 3, userIds: ['2', '3', '7'] }],
            isEdited: false,
            isPinned: false
          },
          {
            id: '3',
            channelId,
            userId: '8',
            userName: 'Vidura',
            userAvatar: '',
            type: 'text',
            content: 'Feel free to share your questions and ideas here. We\'re all here to help! 🚀',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            reactions: [{ emoji: '🔥', count: 4, userIds: ['1', '3', '5', '7'] }],
            isEdited: false,
            isPinned: false
          }
        ];
      }
      
      setChannelMessages(prev => ({
        ...prev,
        [channelId]: defaultMessages
      }));
      setMessages(defaultMessages);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChannel) return;

    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'You';
    const userId = user?.id || 'current-user';
    
    // Create message optimistically
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId: selectedChannel.id,
      userId,
      userName,
      userAvatar: '',
      type: 'text',
      content: messageInput,
      timestamp: new Date().toISOString(),
      reactions: [],
      isEdited: false,
      isPinned: false
    };
    
    // Update UI immediately
    const updatedMessages = [...messages, newMessage];
    setChannelMessages(prev => ({
      ...prev,
      [selectedChannel.id]: updatedMessages
    }));
    setMessages(updatedMessages);
    setMessageInput('');
    setIsTyping(false);
    
    // Auto-reply from bots in bot channels
    if (selectedChannel.name === 'ai-bot' || selectedChannel.name === 'application-help') {
      setTimeout(() => {
        const botId = selectedChannel.name === 'ai-bot' ? 'bot-ai' : 'bot-help';
        const botName = selectedChannel.name === 'ai-bot' ? '🤖 AI Bot' : '❓ Application Help';
        
        let botReply = '';
        const userMsg = messageInput.toLowerCase();
        
        if (selectedChannel.name === 'ai-bot') {
          // AI Bot responses
          if (userMsg.includes('cost') || userMsg.includes('price') || userMsg.includes('expensive')) {
            botReply = '💰 I can help with cost optimization! Based on your current usage patterns, I recommend:\n\n• Right-sizing over-provisioned instances (save ~30%)\n• Implementing auto-scaling policies\n• Using reserved instances for predictable workloads\n• Enabling spot instances for non-critical tasks\n\nWould you like a detailed cost analysis report?';
          } else if (userMsg.includes('terraform') || userMsg.includes('tf')) {
            botReply = '🔧 Terraform best practices:\n\n• Use remote state with locking\n• Organize code with modules\n• Implement proper variable validation\n• Use workspaces for environments\n• Enable detailed logging\n\nI can review your terraform code if you share it!';
          } else if (userMsg.includes('deploy') || userMsg.includes('deployment')) {
            botReply = '🚀 For smooth deployments:\n\n• Use blue-green deployment strategy\n• Implement health checks\n• Enable rollback mechanisms\n• Monitor deployment metrics\n• Use canary releases for critical changes\n\nNeed help troubleshooting a specific deployment?';
          } else if (userMsg.includes('security') || userMsg.includes('secure')) {
            botReply = '🔒 Security recommendations:\n\n• Enable encryption at rest and in transit\n• Implement least-privilege access\n• Regular security audits\n• Use secrets management (Vault/AWS Secrets)\n• Enable MFA for all users\n\nI can perform a security audit of your infrastructure!';
          } else if (userMsg.includes('kubernetes') || userMsg.includes('k8s')) {
            botReply = '☸️ Kubernetes optimization tips:\n\n• Set resource limits and requests\n• Use HPA for auto-scaling\n• Implement pod disruption budgets\n• Enable monitoring with Prometheus\n• Use namespaces for isolation\n\nWhat specific K8s issue are you facing?';
          } else {
            botReply = `✨ I understand you're asking about: "${messageInput}"\n\nI can help you with:\n• Infrastructure optimization\n• Cost analysis\n• Security recommendations\n• Deployment strategies\n• Best practices\n\nCould you provide more details about what you need?`;
          }
        } else {
          // Application Help responses
          if (userMsg.includes('export') || userMsg.includes('download')) {
            botReply = '📥 To export your work:\n\n**Blueprints:** Enterprise Architecture (Krishna) → Select blueprint → Export button\n\n**Templates:** IaC Generator (Vyasa) → Templates tab → Download icon\n\n**Reports:** Analytics (Narada) → Generate report → Export as PDF/CSV\n\nWhich type of export do you need?';
          } else if (userMsg.includes('deploy') || userMsg.includes('deployment')) {
            botReply = '🚀 To deploy infrastructure:\n\n1. Go to Project Dashboard (Yudhishthira)\n2. Select your project\n3. Click "Deploy" button\n4. Choose target environment\n5. Review changes\n6. Confirm deployment\n\nOr use CLI: `dharma-iac deploy --project <name> --env <environment>`';
          } else if (userMsg.includes('create') || userMsg.includes('new')) {
            botReply = '➕ Creating new resources:\n\n**Project:** Quick Access (Arjuna) → New Project\n**Blueprint:** Enterprise Architecture (Krishna) → Create Blueprint\n**Template:** IaC Generator (Vyasa) → New Template\n\nWhat would you like to create?';
          } else if (userMsg.includes('monitor') || userMsg.includes('status')) {
            botReply = '📊 Monitoring options:\n\n• **Real-time:** Cloud Provider Service (Garuda)\n• **Metrics:** Analytics Dashboard (Narada)\n• **Logs:** Monitoring Service (Garuda)\n• **Alerts:** Set up in Compliance (Bhishma)\n\nWhich monitoring view do you need?';
          } else if (userMsg.includes('error') || userMsg.includes('problem') || userMsg.includes('issue')) {
            botReply = '🔧 Troubleshooting help:\n\n1. Check the error message in notifications\n2. View detailed logs in Monitoring (Garuda)\n3. Verify permissions in SSO Service\n4. Check resource availability\n\nCan you share the specific error message you\'re seeing?';
          } else if (userMsg.includes('sidebar') || userMsg.includes('menu') || userMsg.includes('navigate')) {
            botReply = '🧭 Navigation guide:\n\n**Quick Access** - Favorites & Recent items\n**Collaboration** - Team chat & Projects\n**Architecture** - EA, Repository, Solutions\n**Operations** - CMDB, Monitoring, Guardrails\n**Governance** - Analytics, Security, FinOps\n\nEach menu item has a Mahabharat character name for easy reference!';
          } else {
            botReply = `👋 Thanks for reaching out!\n\nI can help you with:\n• Using platform features\n• Navigation and workflows\n• Troubleshooting issues\n• Configuration settings\n\nYour question: "${messageInput}"\n\nCould you be more specific about what you need help with?`;
          }
        }
        
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          channelId: selectedChannel.id,
          userId: botId,
          userName: botName,
          userAvatar: '',
          type: 'text',
          content: botReply,
          timestamp: new Date().toISOString(),
          reactions: [],
          isEdited: false,
          isPinned: false
        };
        
        const withBotReply = [...updatedMessages, botMessage];
        setChannelMessages(prev => ({
          ...prev,
          [selectedChannel.id]: withBotReply
        }));
        setMessages(withBotReply);
      }, 1500); // Bot replies after 1.5 seconds
    }
    
    // Try to send to backend in background
    try {
      const url = `${API_URL}/collaboration/channels/${selectedChannel.id}/messages`;
      const payload = { userId, userName, type: 'text', content: newMessage.content };
      console.log('Sending message to:', url, payload);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const serverMessage = await response.json();
        // Update with server response (includes proper ID, timestamp, etc.)
        const serverUpdatedMessages = updatedMessages.map(m => 
          m.id === newMessage.id ? serverMessage : m
        );
        setChannelMessages(prev => ({
          ...prev,
          [selectedChannel.id]: serverUpdatedMessages
        }));
        setMessages(serverUpdatedMessages);
      }
    } catch (error: any) {
      console.error('Error sending message to server:', error);
      // Message already displayed, just log the error
    }
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedChannel) {
      const file = files[0];
      toast.info(`File upload feature coming soon: ${file.name}`);
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
    setActiveCall(!activeCall);
    if (!activeCall) {
      toast.success(`🎙️ Voice call started in #${selectedChannel.name}`);
    } else {
      toast.success('Call ended');
    }
  };

  const handleVideoCall = () => {
    if (!selectedChannel) return;
    setActiveCall(!activeCall);
    setIsVideoOn(true);
    if (!activeCall) {
      toast.success(`📹 Video call started in #${selectedChannel.name}`);
    } else {
      toast.success('Call ended');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? '🎤 Microphone on' : '🔇 Muted');
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.success(isVideoOn ? '📹 Camera off' : '📹 Camera on');
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(isScreenSharing ? 'Screen sharing stopped' : '🖥️ Screen sharing started');
  };

  const handleChannelSettings = () => {
    if (!selectedChannel) return;
    alert(`⚙️ Channel Settings: #${selectedChannel.name}\n\nMembers: ${selectedChannel.members.length}\nType: ${selectedChannel.type}\nDescription: ${selectedChannel.description || 'No description'}`);
  };

  const commonEmojis = ['😀', '😂', '😊', '👍', '❤️', '🎉', '🔥', '👏', '✅', '💯', '🚀', '💡', '⚡', '🎯', '👀', '🤔', '😎', '🙌', '💪', '⭐'];

  const quickReactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '❤️', label: 'Love' },
    { emoji: '😂', label: 'Haha' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '💡', label: 'Idea' },
  ];

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

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const userId = user?.id || 'current-user';
      
      const response = await fetch(`${API_URL}/collaboration/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, emoji })
      });

      if (!response.ok) throw new Error('Failed to add reaction');
      
      // Reload messages to get updated reactions
      if (selectedChannel) {
        await loadMessages(selectedChannel.id);
      }
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
    {loading ? (
      <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
        />
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-800 dark:text-gray-300 font-semibold text-lg">Loading collaboration...</p>
        </div>
      </div>
    ) : (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"
        />
      </div>
      {/* Sidebar - Channels */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col relative z-10 shadow-2xl"
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-blue-600" />
              </motion.div>
              Dharma IaC Channels
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5 text-blue-600" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setAiMode(!aiMode)}
                className={`p-2 rounded-xl transition-all ${
                  aiMode
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                    : 'hover:bg-white dark:hover:bg-gray-700'
                }`}
                title="AI Mode"
              >
                <Brain className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Enhanced Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/30 dark:to-indigo-900/30 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="relative">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stats.activeUsers}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Online Now</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="text-center p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {stats.messagesLast24h}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Messages 24h</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence>
            {filteredChannels.map((channel, idx) => (
              <motion.button
                key={channel.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4, scale: 1.02 }}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-all border-l-4 relative group ${
                  selectedChannel?.id === channel.id
                    ? 'bg-gradient-to-r from-blue-50/90 to-purple-50/90 dark:from-blue-900/30 dark:to-purple-900/30 backdrop-blur-xl border-blue-500 shadow-lg'
                    : 'border-transparent hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {selectedChannel?.id === channel.id && (
                  <motion.div
                    layoutId="activeChannel"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`relative p-2.5 rounded-xl ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  }`}
                >
                  {getChannelIcon(channel.type)}
                  {channel.unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </>
                  )}
                </motion.div>
                
                <div className="flex-1 text-left min-w-0 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white truncate">
                      {channel.name}
                    </span>
                    {channel.isPinned && (
                      <motion.div
                        animate={{ rotate: [0, -20, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Pin className="w-3 h-3 text-yellow-500 fill-current" />
                      </motion.div>
                    )}
                    {channel.isMuted && <BellOff className="w-3 h-3 text-gray-400" />}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate mt-0.5">
                      <span className="font-semibold">{channel.lastMessage.userName}:</span> {channel.lastMessage.content}
                    </p>
                  )}
                </div>

                {channel.unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    <Badge variant="blue" className="text-xs px-2 font-bold shadow-lg">
                      {channel.unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col relative z-10"
      >
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <div className="min-h-16 px-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-lg">
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg"
                  >
                    {getChannelIcon(selectedChannel.type)}
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                      {selectedChannel.name}
                      {aiMode && (
                        <motion.span
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium flex items-center gap-1"
                        >
                          <Brain className="w-3 h-3" />
                          AI
                        </motion.span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      {selectedChannel.members.length} members • {onlineUsers.filter(u => u.status === 'online').length} online
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceCall}
                    className={`p-2.5 rounded-xl transition-all shadow-lg ${
                      activeCall && !isVideoOn
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : 'bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                    title="Voice call"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVideoCall}
                    className={`p-2.5 rounded-xl transition-all shadow-lg ${
                      activeCall && isVideoOn
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleChannelSettings}
                    className="p-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg"
                    title="Settings"
                  >
                    <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowUserPanel(!showUserPanel)}
                    className="p-2.5 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg"
                    title="Team panel"
                  >
                    <Users className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.button>
                </div>
              </div>

              {/* Active Call Bar */}
              <AnimatePresence>
                {activeCall && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pb-3 border-t border-gray-200/50 dark:border-gray-700/50 pt-3"
                  >
                    <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl rounded-xl p-3 border border-green-200/50 dark:border-green-800/50">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold"
                        >
                          <div className="relative">
                            <Wifi className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                          </div>
                          <span className="text-sm">Call Active</span>
                        </motion.div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">3 participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={toggleMute}
                          className={`p-2 rounded-lg transition-all ${
                            isMuted
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </motion.button>
                        {isVideoOn && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={toggleVideo}
                              className="p-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
                            >
                              {isVideoOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={toggleScreenShare}
                              className={`p-2 rounded-lg transition-all ${
                                isScreenSharing
                                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              <ScreenShare className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={activeCall ? handleVoiceCall : handleVideoCall}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all font-semibold text-sm"
                        >
                          End Call
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="mb-4"
                    >
                      <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto" />
                    </motion.div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">No messages yet</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start the conversation!</p>
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => {
                const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
                const isCurrentUser = message.userId === (user?.id || 'current-user');

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex gap-3 group ${showAvatar ? 'mt-4' : 'mt-1'}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 flex-shrink-0">
                      {showAvatar && (
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
                        >
                          {message.userName.split(' ').map(n => n[0]).join('')}
                        </motion.div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(message.timestamp)}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                              You
                            </span>
                          )}
                        </div>
                      )}

                      {/* Message body */}
                      {message.type === 'code' ? (
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 overflow-x-auto shadow-lg border border-gray-700"
                        >
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
                            <Code className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400 font-semibold">Code Block</span>
                          </div>
                          <pre className="text-sm text-gray-100 font-mono">
                            <code>{message.content}</code>
                          </pre>
                        </motion.div>
                      ) : message.type === 'system' ? (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 backdrop-blur-sm border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 shadow-lg"
                        >
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            {message.content}
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.01, y: -2 }}
                          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-500/50 hover:shadow-lg transition-all group-hover:shadow-xl"
                        >
                          <p className="text-gray-900 dark:text-gray-100 break-words font-medium leading-relaxed">
                            {message.content}
                          </p>
                        </motion.div>
                      )}

                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {message.attachments.map((attachment) => (
                            <motion.a
                              key={attachment.id}
                              href={attachment.url}
                              whileHover={{ scale: 1.05, y: -2 }}
                              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl hover:shadow-lg transition-all border border-blue-200/50 dark:border-blue-800/50"
                            >
                              <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                                {attachment.name}
                              </span>
                            </motion.a>
                          ))}
                        </div>
                      )}

                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.reactions.map((reaction, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => addReaction(message.id, reaction.emoji)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 rounded-full transition-all shadow-sm border border-blue-200/50 dark:border-blue-800/50"
                            >
                              <span className="text-base">{reaction.emoji}</span>
                              <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                                {reaction.count}
                              </span>
                            </motion.button>
                          ))}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-all shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            <Plus className="w-3 h-3 text-gray-500" />
                          </motion.button>
                        </div>
                      )}

                      {/* Quick Reactions */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="mt-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1 flex-wrap"
                      >
                        {quickReactions.map((reaction) => (
                          <motion.button
                            key={reaction.emoji}
                            whileHover={{ scale: 1.2, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                            title={reaction.label}
                          >
                            <span className="text-lg">{reaction.emoji}</span>
                          </motion.button>
                        ))}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <Reply className="w-4 h-4 text-gray-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </motion.button>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })
              )}
              
              {/* Typing indicator */}
              <AnimatePresence>
                {typingUsers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-3 items-center"
                  >
                    <div className="w-10" />
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 backdrop-blur-sm rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="flex gap-1"
                      >
                        <span className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="w-2 h-2 bg-purple-600 rounded-full" style={{ animationDelay: '0.2s' }} />
                        <span className="w-2 h-2 bg-pink-600 rounded-full" style={{ animationDelay: '0.4s' }} />
                      </motion.div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="px-6 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 relative">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFileAttachment}
                      className="p-2.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg border border-gray-200 dark:border-gray-600"
                      title="Attach file"
                    >
                      <Paperclip className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCodeBlock}
                      className="p-2.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg border border-gray-200 dark:border-gray-600"
                      title="Code block"
                    >
                      <Code className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg border border-gray-200 dark:border-gray-600"
                        title="Emoji"
                      >
                        <Smile className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </motion.button>
                      <AnimatePresence>
                        {showEmojiPicker && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                            className="absolute bottom-full left-0 mb-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border border-gray-200 dark:border-gray-600 rounded-2xl shadow-2xl p-4 z-50"
                          >
                            <div className="grid grid-cols-10 gap-2 w-80">
                              {commonEmojis.map((emoji, index) => (
                                <motion.button
                                  key={index}
                                  whileHover={{ scale: 1.2, rotate: 10 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEmojiClick(emoji)}
                                  className="text-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-lg p-2 transition-all"
                                >
                                  {emoji}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleMention}
                      className="p-2.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all shadow-lg border border-gray-200 dark:border-gray-600"
                      title="Mention"
                    >
                      <AtSign className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </motion.button>
                    {aiMode && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800"
                      >
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">AI Assist</span>
                      </motion.div>
                    )}
                  </div>
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      setIsTyping(e.target.value.length > 0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={aiMode ? `Ask AI or message #${selectedChannel.name}...` : `Message #${selectedChannel.name}...`}
                    rows={3}
                    className="w-full px-5 py-4 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-lg transition-all"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700 text-white rounded-xl transition-all disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
                  title={!messageInput.trim() ? 'Type a message first' : 'Send message'}
                >
                  <Send className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <MessageSquare className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto" />
              </motion.div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a Dharma IaC channel
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a channel from the sidebar to collaborate with your team
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Right Sidebar - Online Users */}
      <AnimatePresence>
        {showUserPanel && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl border-l border-gray-200/50 dark:border-gray-700/50 relative z-10 shadow-2xl"
          >
            <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-950/30 dark:to-purple-950/30 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Dharma Team
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUserPanel(false)}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {onlineUsers.filter(u => u.status === 'online').length} online \u2022 {onlineUsers.length} total
                </p>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar h-[calc(100%-80px)]">
              {onlineUsers.map((usr, idx) => (
                <motion.div
                  key={usr.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all cursor-pointer border-l-4 border-transparent hover:border-blue-500 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg"
                      >
                        {usr.name.split(' ').map(n => n[0]).join('')}
                      </motion.div>
                      <motion.div
                        animate={
                          (usr.id === 'bot-ai' || usr.id === 'bot-help')
                            ? { scale: [1, 1.3, 1], boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.7)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)'] }
                            : usr.status === 'online' ? { scale: [1, 1.2, 1] } : {}
                        }
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(usr.status)} rounded-full border-2 border-white dark:border-gray-800 shadow-lg`}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {usr.name}
                        </p>
                        {(usr.id === 'bot-ai' || usr.id === 'bot-help') && (
                          <motion.span
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg"
                          >
                            ALWAYS ON
                          </motion.span>
                        )}
                      </div>
                      {usr.statusMessage ? (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {usr.statusMessage}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium capitalize flex items-center gap-1">
                          <Circle className="w-2 h-2 fill-current" />
                          {(usr.id === 'bot-ai' || usr.id === 'bot-help') ? 'Always Available' : usr.status}
                        </p>
                      )}
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    )}
    </MainLayout>
  );
}
