const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'whatsapp';

if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined in environment variables');
  process.exit(1);
}

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

// Connect to the whatsapp database specifically
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: DB_NAME
})
.then(() => console.log(`Connected to MongoDB - ${DB_NAME} database`))
.catch(err => console.error('MongoDB connection error:', err));

const ProcessedMessage = mongoose.models.ProcessedMessage || mongoose.model('ProcessedMessage', messageSchema, 'processed_messages');

class PayloadProcessor {
  constructor() {
    this.processedMessages = new Map(); // Track processed messages
    this.statusUpdates = []; // Queue for status updates
  }

  // Get all JSON files in the project directory
  getPayloadFiles() {
    const projectDir = path.join(__dirname, '..');
    const files = fs.readdirSync(projectDir);
    
    const messageFiles = files.filter(file => 
      file.endsWith('.json') && 
      file.includes('message') && 
      !file.includes('status')
    );
    
    const statusFiles = files.filter(file => 
      file.endsWith('.json') && 
      file.includes('status')
    );

    return { messageFiles, statusFiles };
  }

  // Read and parse JSON file
  readPayloadFile(filename) {
    try {
      const filePath = path.join(__dirname, '..', filename);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return null;
    }
  }

  // Process message payload and insert into database
  async processMessagePayload(payload, filename) {
    try {
      console.log(`Processing message payload: ${filename}`);
      
      if (!payload.metaData || !payload.metaData.entry) {
        console.log(`Skipping ${filename}: Invalid payload structure`);
        return;
      }

      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      const value = change.value;

      if (!value.messages || value.messages.length === 0) {
        console.log(`Skipping ${filename}: No messages found`);
        return;
      }

      const message = value.messages[0];
      const contact = value.contacts[0];
      const metadata = value.metadata;

      // Extract conversation ID from filename or use waId
      const conversationMatch = filename.match(/conversation_(\d+)/);
      const conversationId = conversationMatch ? 
        `conv_${conversationMatch[1]}_${contact.wa_id}` : 
        `conv_${contact.wa_id}`;

      const messageData = {
        messageId: message.id,
        waId: contact.wa_id,
        userName: contact.profile.name,
        messageBody: message.text ? message.text.body : message.body || 'Media message',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: 'sent',
        type: message.type,
        from: message.from,
        conversationId: conversationId,
        meta_msg_id: message.id, // Same as messageId for WhatsApp
        payloadId: payload._id,
        phoneNumberId: metadata.phone_number_id,
        displayPhoneNumber: metadata.display_phone_number
      };

      // Check if message already exists
      const existingMessage = await ProcessedMessage.findOne({ 
        messageId: message.id 
      });

      if (!existingMessage) {
        const newMessage = new ProcessedMessage(messageData);
        await newMessage.save();
        console.log(`✅ Message saved: ${messageData.messageBody.substring(0, 50)}...`);
        
        // Store in our tracking map
        this.processedMessages.set(message.id, messageData);
        
        return newMessage;
      } else {
        console.log(`⚠️  Message already exists: ${message.id}`);
        this.processedMessages.set(message.id, existingMessage);
        return existingMessage;
      }

    } catch (error) {
      console.error(`Error processing message payload ${filename}:`, error);
    }
  }

  // Process status update payload
  async processStatusPayload(payload, filename) {
    try {
      console.log(`Processing status payload: ${filename}`);
      
      if (!payload.metaData || !payload.metaData.entry) {
        console.log(`Skipping ${filename}: Invalid payload structure`);
        return;
      }

      const entry = payload.metaData.entry[0];
      const change = entry.changes[0];
      const value = change.value;

      if (!value.statuses || value.statuses.length === 0) {
        console.log(`Skipping ${filename}: No status updates found`);
        return;
      }

      const status = value.statuses[0];
      const messageId = status.id;
      const newStatus = status.status;

      // Try to update using messageId first
      let updatedMessage = await ProcessedMessage.findOneAndUpdate(
        { messageId: messageId },
        { 
          status: newStatus,
          $addToSet: { 
            statusHistory: {
              status: newStatus,
              timestamp: new Date(parseInt(status.timestamp) * 1000),
              updatedAt: new Date()
            }
          }
        },
        { new: true }
      );

      // If not found by messageId, try meta_msg_id
      if (!updatedMessage) {
        updatedMessage = await ProcessedMessage.findOneAndUpdate(
          { meta_msg_id: messageId },
          { 
            status: newStatus,
            $addToSet: { 
              statusHistory: {
                status: newStatus,
                timestamp: new Date(parseInt(status.timestamp) * 1000),
                updatedAt: new Date()
              }
            }
          },
          { new: true }
        );
      }

      if (updatedMessage) {
        console.log(`✅ Status updated for message ${messageId}: ${newStatus}`);
        return updatedMessage;
      } else {
        console.log(`⚠️  Message not found for status update: ${messageId}`);
        // Store for later processing
        this.statusUpdates.push({
          messageId,
          status: newStatus,
          timestamp: status.timestamp,
          filename
        });
      }

    } catch (error) {
      console.error(`Error processing status payload ${filename}:`, error);
    }
  }

  // Process all pending status updates
  async processPendingStatusUpdates() {
    if (this.statusUpdates.length === 0) {
      return;
    }

    console.log(`\n📋 Processing ${this.statusUpdates.length} pending status updates...`);
    
    for (const statusUpdate of this.statusUpdates) {
      try {
        const updatedMessage = await ProcessedMessage.findOneAndUpdate(
          { 
            $or: [
              { messageId: statusUpdate.messageId },
              { meta_msg_id: statusUpdate.messageId }
            ]
          },
          { 
            status: statusUpdate.status,
            $addToSet: { 
              statusHistory: {
                status: statusUpdate.status,
                timestamp: new Date(parseInt(statusUpdate.timestamp) * 1000),
                updatedAt: new Date()
              }
            }
          },
          { new: true }
        );

        if (updatedMessage) {
          console.log(`✅ Delayed status update successful for ${statusUpdate.messageId}: ${statusUpdate.status}`);
        } else {
          console.log(`❌ Failed to update status for ${statusUpdate.messageId} (from ${statusUpdate.filename})`);
        }
      } catch (error) {
        console.error(`Error in delayed status update for ${statusUpdate.messageId}:`, error);
      }
    }
  }

  // Main processing function
  async processAllPayloads() {
    try {
      console.log('🚀 Starting payload processing...\n');

      const { messageFiles, statusFiles } = this.getPayloadFiles();
      
      console.log(`Found ${messageFiles.length} message files and ${statusFiles.length} status files\n`);

      // First, process all message payloads
      console.log('📨 Processing message payloads...');
      for (const file of messageFiles) {
        const payload = this.readPayloadFile(file);
        if (payload) {
          await this.processMessagePayload(payload, file);
        }
      }

      console.log('\n📊 Processing status payloads...');
      // Then process status updates
      for (const file of statusFiles) {
        const payload = this.readPayloadFile(file);
        if (payload) {
          await this.processStatusPayload(payload, file);
        }
      }

      // Process any pending status updates
      await this.processPendingStatusUpdates();

      // Show summary
      await this.showSummary();

    } catch (error) {
      console.error('Error in processAllPayloads:', error);
    }
  }

  // Show processing summary
  async showSummary() {
    try {
      console.log('\n📈 Processing Summary:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const totalMessages = await ProcessedMessage.countDocuments();
      const sentMessages = await ProcessedMessage.countDocuments({ status: 'sent' });
      const deliveredMessages = await ProcessedMessage.countDocuments({ status: 'delivered' });
      const readMessages = await ProcessedMessage.countDocuments({ status: 'read' });

      console.log(`Total messages in database: ${totalMessages}`);
      console.log(`Messages by status:`);
      console.log(`  📤 Sent: ${sentMessages}`);
      console.log(`  📨 Delivered: ${deliveredMessages}`);
      console.log(`  👁️  Read: ${readMessages}`);

      // Show conversations
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

      console.log(`\nConversations found: ${conversations.length}`);
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv._id} - ${conv.messageCount} messages - Participants: ${conv.participants.join(', ')}`);
      });

    } catch (error) {
      console.error('Error showing summary:', error);
    }
  }

  // Get all messages from database
  async getAllMessages() {
    try {
      const messages = await ProcessedMessage.find().sort({ timestamp: 1 });
      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  // Get messages by conversation ID
  async getMessagesByConversation(conversationId) {
    try {
      const messages = await ProcessedMessage.find({ conversationId }).sort({ timestamp: 1 });
      return messages;
    } catch (error) {
      console.error('Error fetching messages by conversation:', error);
      return [];
    }
  }

  // Update message status by ID
  async updateMessageStatus(messageId, newStatus) {
    try {
      const updatedMessage = await ProcessedMessage.findOneAndUpdate(
        { 
          $or: [
            { messageId: messageId },
            { meta_msg_id: messageId }
          ]
        },
        { 
          status: newStatus,
          $addToSet: { 
            statusHistory: {
              status: newStatus,
              timestamp: new Date(),
              updatedAt: new Date()
            }
          }
        },
        { new: true }
      );

      if (updatedMessage) {
        console.log(`✅ Status updated for message ${messageId}: ${newStatus}`);
        return updatedMessage;
      } else {
        console.log(`❌ Message not found: ${messageId}`);
        return null;
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      return null;
    }
  }
}

// CLI Interface
async function main() {
  const processor = new PayloadProcessor();
  
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'process':
      await processor.processAllPayloads();
      break;
    
    case 'summary':
      await processor.showSummary();
      break;
    
    case 'messages':
      const messages = await processor.getAllMessages();
      console.log(JSON.stringify(messages, null, 2));
      break;
    
    case 'conversation':
      const convId = args[1];
      if (!convId) {
        console.log('Usage: node process-payloads.js conversation <conversationId>');
        break;
      }
      const convMessages = await processor.getMessagesByConversation(convId);
      console.log(JSON.stringify(convMessages, null, 2));
      break;
    
    case 'update-status':
      const msgId = args[1];
      const status = args[2];
      if (!msgId || !status) {
        console.log('Usage: node process-payloads.js update-status <messageId> <status>');
        break;
      }
      await processor.updateMessageStatus(msgId, status);
      break;
    
    default:
      console.log('WhatsApp Payload Processor');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Available commands:');
      console.log('  process              - Process all payload files');
      console.log('  summary              - Show processing summary');
      console.log('  messages             - Get all messages');
      console.log('  conversation <id>    - Get messages by conversation ID');
      console.log('  update-status <id> <status> - Update message status');
      console.log('\nExamples:');
      console.log('  node process-payloads.js process');
      console.log('  node process-payloads.js summary');
      console.log('  node process-payloads.js conversation conv_1_919937320320');
      console.log('  node process-payloads.js update-status wamid.HBg... delivered');
  }

  // Close database connection
  await mongoose.connection.close();
}

// Export for use as a module
module.exports = PayloadProcessor;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
