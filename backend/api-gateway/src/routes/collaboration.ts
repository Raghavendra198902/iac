import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

export function createCollaborationRoutes(pool: Pool): Router {
  const router = Router();

  // Get all channels
  router.get('/channels', async (req: Request, res: Response) => {
    try {
      const channelsResult = await pool.query(`
        SELECT 
          c.id,
          c.name,
          c.type,
          c.description,
          c.created_by,
          c.is_pinned,
          c.is_archived,
          c.created_at,
          COUNT(DISTINCT cm.user_id) as member_count,
          (
            SELECT json_build_object(
              'id', m.id,
              'userId', m.user_id,
              'userName', m.user_name,
              'type', m.type,
              'content', m.content,
              'timestamp', m.created_at
            )
            FROM collaboration_messages m
            WHERE m.channel_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
          ) as last_message
        FROM collaboration_channels c
        LEFT JOIN collaboration_channel_members cm ON c.id = cm.channel_id
        WHERE c.is_archived = FALSE
        GROUP BY c.id
        ORDER BY c.is_pinned DESC, c.created_at DESC
      `);

      const channels = await Promise.all(channelsResult.rows.map(async (channel) => {
        // Get members for each channel
        const membersResult = await pool.query(
          'SELECT user_id FROM collaboration_channel_members WHERE channel_id = $1',
          [channel.id]
        );

        // Get unread count (simplified - would need user context in real app)
        const unreadResult = await pool.query(
          `SELECT COUNT(*) as unread 
           FROM collaboration_messages 
           WHERE channel_id = $1 
           AND created_at > NOW() - INTERVAL '24 hours'`,
          [channel.id]
        );

        return {
          id: channel.id,
          name: channel.name,
          type: channel.type,
          description: channel.description,
          members: membersResult.rows.map(m => m.user_id),
          unreadCount: Math.min(parseInt(unreadResult.rows[0].unread) || 0, 10),
          createdAt: channel.created_at,
          createdBy: channel.created_by,
          isPinned: channel.is_pinned,
          lastMessage: channel.last_message
        };
      }));

      res.json(channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  });

  // Get messages for a channel
  router.get('/channels/:channelId/messages', async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;

      const messagesResult = await pool.query(`
        SELECT 
          m.id,
          m.channel_id,
          m.user_id,
          m.user_name,
          m.type,
          m.content,
          m.reply_to,
          m.mentions,
          m.is_edited,
          m.created_at as timestamp
        FROM collaboration_messages m
        WHERE m.channel_id = $1 AND m.is_deleted = FALSE
        ORDER BY m.created_at ASC
        LIMIT $2
      `, [channelId, limit]);

      const messages = await Promise.all(messagesResult.rows.map(async (msg) => {
        // Get attachments
        const attachmentsResult = await pool.query(
          `SELECT id, file_name as name, file_type as type, file_size as size, file_url as url
           FROM collaboration_message_attachments WHERE message_id = $1`,
          [msg.id]
        );

        // Get reactions
        const reactionsResult = await pool.query(
          `SELECT emoji, array_agg(user_id) as users, COUNT(*) as count
           FROM collaboration_message_reactions
           WHERE message_id = $1
           GROUP BY emoji`,
          [msg.id]
        );

        return {
          id: msg.id,
          channelId: msg.channel_id,
          userId: msg.user_id,
          userName: msg.user_name,
          type: msg.type,
          content: msg.content,
          replyTo: msg.reply_to,
          mentions: msg.mentions,
          timestamp: msg.timestamp,
          attachments: attachmentsResult.rows,
          reactions: reactionsResult.rows.map(r => ({
            emoji: r.emoji,
            users: r.users,
            count: parseInt(r.count)
          }))
        };
      }));

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send a message
  router.post('/channels/:channelId/messages', async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      const { userId, userName, type = 'text', content, mentions, replyTo } = req.body;

      if (!userId || !userName || !content) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const messageId = `msg-${Date.now()}`;

      await pool.query(
        `INSERT INTO collaboration_messages 
         (id, channel_id, user_id, user_name, type, content, mentions, reply_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [messageId, channelId, userId, userName, type, content, mentions || null, replyTo || null]
      );

      const result = await pool.query(
        `SELECT id, channel_id, user_id, user_name, type, content, 
                mentions, reply_to, created_at as timestamp
         FROM collaboration_messages WHERE id = $1`,
        [messageId]
      );

      const message = result.rows[0];
      res.status(201).json({
        id: message.id,
        channelId: message.channel_id,
        userId: message.user_id,
        userName: message.user_name,
        type: message.type,
        content: message.content,
        mentions: message.mentions,
        replyTo: message.reply_to,
        timestamp: message.timestamp,
        attachments: [],
        reactions: []
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Add reaction to message
  router.post('/messages/:messageId/reactions', async (req: Request, res: Response) => {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      if (!userId || !emoji) {
        return res.status(400).json({ error: 'Missing userId or emoji' });
      }

      // Check if reaction already exists
      const existing = await pool.query(
        'SELECT id FROM collaboration_message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3',
        [messageId, userId, emoji]
      );

      if (existing.rows.length > 0) {
        // Remove reaction
        await pool.query(
          'DELETE FROM collaboration_message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3',
          [messageId, userId, emoji]
        );
        res.json({ action: 'removed' });
      } else {
        // Add reaction
        await pool.query(
          'INSERT INTO collaboration_message_reactions (message_id, user_id, emoji) VALUES ($1, $2, $3)',
          [messageId, userId, emoji]
        );
        res.json({ action: 'added' });
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      res.status(500).json({ error: 'Failed to toggle reaction' });
    }
  });

  // Get online users
  router.get('/users/online', async (req: Request, res: Response) => {
    try {
      const result = await pool.query(`
        SELECT 
          user_id as id,
          user_name as name,
          user_email as email,
          status,
          status_message,
          last_seen
        FROM user_status
        ORDER BY 
          CASE status 
            WHEN 'online' THEN 1 
            WHEN 'away' THEN 2 
            WHEN 'busy' THEN 3 
            ELSE 4 
          END,
          user_name
      `);

      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching online users:', error);
      res.status(500).json({ error: 'Failed to fetch online users' });
    }
  });

  // Update user status
  router.patch('/users/:userId/status', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { status, statusMessage } = req.body;

      await pool.query(
        `INSERT INTO user_status (user_id, user_name, user_email, status, status_message, last_seen)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           status = EXCLUDED.status,
           status_message = EXCLUDED.status_message,
           last_seen = NOW()`,
        [userId, req.body.userName || userId, req.body.userEmail || `${userId}@example.com`, status, statusMessage]
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Get collaboration stats
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM collaboration_messages WHERE created_at > NOW() - INTERVAL '24 hours') as messages_last_24h,
          (SELECT COUNT(*) FROM user_status WHERE status = 'online') as active_users,
          (SELECT COUNT(*) FROM collaboration_channels WHERE is_archived = FALSE) as channels,
          (SELECT COUNT(*) FROM collaboration_messages) as total_messages
      `);

      res.json(stats.rows[0]);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  return router;
}
