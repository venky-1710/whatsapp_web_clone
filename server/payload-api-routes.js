// API routes for payload processing and message management
const PayloadProcessor = require('./process-payloads');
const mongoose = require('mongoose');

// Message Schema - same as in server.js but for the whatsapp database
const messageSchema = new mongoose.Schema({
  messageId: { type: String, required: true, unique: true },
  waId: { type: String, required: true },
  userName: { type: String, required: true },
  messageBody: { type: String, required: true },
  timestamp: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  type: { type: String, default: 'text' },
  from: { type: String, required: true },
  conversationId: { type: String, required: true },
  meta_msg_id: { type: String }, // Additional field for meta message ID
  payloadId: { type: String }, // Store the original payload ID
  phoneNumberId: { type: String }, // Store phone number ID from metadata
  displayPhoneNumber: { type: String } // Store display phone number
}, {
  timestamps: true
});

const ProcessedMessage = mongoose.models.ProcessedMessage || mongoose.model('ProcessedMessage', messageSchema, 'processed_messages');

const payloadRoutes = {
  
  // Process all payloads manually via API
  async processPayloads(req, res) {
    try {
      console.log('API: Starting payload processing...');
      const processor = new PayloadProcessor();
      await processor.processAllPayloads();
      
      res.json({
        success: true,
        message: 'Payloads processed successfully'
      });
    } catch (error) {
      console.error('API Error processing payloads:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process payloads',
        details: error.message
      });
    }
  },

  // Get all processed messages with pagination
  async getProcessedMessages(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const total = await ProcessedMessage.countDocuments();
      const messages = await ProcessedMessage.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);
      
      res.json({
        success: true,
        data: messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('API Error fetching messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages',
        details: error.message
      });
    }
  },

  // Get messages by conversation ID
  async getConversationMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const messages = await ProcessedMessage.find({ conversationId })
        .sort({ timestamp: 1 });
      
      res.json({
        success: true,
        data: messages,
        conversationId
      });
    } catch (error) {
      console.error('API Error fetching conversation messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversation messages',
        details: error.message
      });
    }
  },

  // Update message status
  async updateMessageStatus(req, res) {
    try {
      const { messageId } = req.params;
      const { status } = req.body;

      if (!status || !['sent', 'delivered', 'read'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: sent, delivered, or read'
        });
      }

      const updatedMessage = await ProcessedMessage.findOneAndUpdate(
        { 
          $or: [
            { messageId: messageId },
            { meta_msg_id: messageId }
          ]
        },
        { 
          status: status,
          $addToSet: { 
            statusHistory: {
              status: status,
              timestamp: new Date(),
              updatedAt: new Date()
            }
          }
        },
        { new: true }
      );
      
      if (updatedMessage) {
        res.json({
          success: true,
          message: 'Status updated successfully',
          data: updatedMessage
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Message not found'
        });
      }
    } catch (error) {
      console.error('API Error updating message status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update message status',
        details: error.message
      });
    }
  },

  // Get processing summary/statistics
  async getProcessingSummary(req, res) {
    try {
      const totalMessages = await ProcessedMessage.countDocuments();
      const sentMessages = await ProcessedMessage.countDocuments({ status: 'sent' });
      const deliveredMessages = await ProcessedMessage.countDocuments({ status: 'delivered' });
      const readMessages = await ProcessedMessage.countDocuments({ status: 'read' });

      const conversations = await ProcessedMessage.aggregate([
        {
          $group: {
            _id: '$conversationId',
            messageCount: { $sum: 1 },
            participants: { $addToSet: '$userName' },
            lastMessage: { $max: '$timestamp' }
          }
        },
        { $sort: { lastMessage: -1 } }
      ]);
      
      res.json({
        success: true,
        summary: {
          totalMessages,
          messagesByStatus: {
            sent: sentMessages,
            delivered: deliveredMessages,
            read: readMessages
          },
          conversations: conversations.map((conv, index) => ({
            id: conv._id,
            messageCount: conv.messageCount,
            participants: conv.participants,
            lastMessage: conv.lastMessage
          }))
        }
      });
    } catch (error) {
      console.error('API Error getting summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get processing summary',
        details: error.message
      });
    }
  },

  // Bulk update message statuses
  async bulkUpdateStatuses(req, res) {
    try {
      const { updates } = req.body; // Array of {messageId, status}
      
      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: 'Updates must be an array of {messageId, status} objects'
        });
      }

      const results = [];
      for (const update of updates) {
        try {
          const result = await ProcessedMessage.findOneAndUpdate(
            { 
              $or: [
                { messageId: update.messageId },
                { meta_msg_id: update.messageId }
              ]
            },
            { 
              status: update.status,
              $addToSet: { 
                statusHistory: {
                  status: update.status,
                  timestamp: new Date(),
                  updatedAt: new Date()
                }
              }
            },
            { new: true }
          );
          
          results.push({
            messageId: update.messageId,
            status: update.status,
            success: !!result
          });
        } catch (err) {
          results.push({
            messageId: update.messageId,
            status: update.status,
            success: false,
            error: err.message
          });
        }
      }

      res.json({
        success: true,
        message: 'Bulk update completed',
        results
      });
    } catch (error) {
      console.error('API Error bulk updating statuses:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to bulk update statuses',
        details: error.message
      });
    }
  }
};

module.exports = payloadRoutes;
