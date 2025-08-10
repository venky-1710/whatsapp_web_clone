const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const PayloadProcessor = require('./process-payloads');
const payloadRoutes = require('./payload-api-routes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || process.env.CLIENT_URL ,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: [
    "https://whatsapp-web-clone-nine-jade.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'whatsapp';

if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: DB_NAME
})
.then(() => console.log(`Connected to MongoDB - ${DB_NAME} database`))
.catch(err => console.error('MongoDB connection error:', err));

// Message Schema
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
  conversationId: { type: String, required: true }
}, {
  timestamps: true
});

const Message = mongoose.model('Message', messageSchema, 'processed_messages');

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Process webhook payloads from JSON files
async function processWebhookPayloads() {
  const payloadFiles = [
    'conversation_1_message_1.json',
    'conversation_1_message_2.json',
    'conversation_2_message_1.json',
    'conversation_2_message_2.json'
  ];

  for (const file of payloadFiles) {
    try {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        await processMessagePayload(data);
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  // Process status updates
  const statusFiles = [
    'conversation_1_status_1.json',
    'conversation_1_status_2.json',
    'conversation_2_status_1.json',
    'conversation_2_status_2.json',
    'conversation_2_status_delivered.json',
    'conversation_2_status_read.json'
  ];

  for (const file of statusFiles) {
    try {
      const filePath = path.join(__dirname, '..', file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        await processStatusUpdate(data);
      }
    } catch (error) {
      console.error(`Error processing status ${file}:`, error);
    }
  }
}

// Process message payload
async function processMessagePayload(payload) {
  try {
    const entry = payload.metaData.entry[0];
    const change = entry.changes[0];
    const value = change.value;

    if (value.messages && value.messages.length > 0) {
      const message = value.messages[0];
      const contact = value.contacts[0];

      const messageData = {
        messageId: message.id,
        waId: contact.wa_id,
        userName: contact.profile.name,
        messageBody: message.text.body,
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        status: 'sent',
        type: message.type,
        from: message.from,
        conversationId: `conv_${contact.wa_id}`
      };

      // Check if message already exists
      const existingMessage = await Message.findOne({ messageId: message.id });
      if (!existingMessage) {
        const newMessage = new Message(messageData);
        await newMessage.save();
        console.log('Message saved:', messageData.messageBody);
        
        // Emit to connected clients
        io.emit('newMessage', messageData);
      }
    }
  } catch (error) {
    console.error('Error processing message payload:', error);
  }
}

// Process status update
async function processStatusUpdate(payload) {
  try {
    const entry = payload.metaData.entry[0];
    const change = entry.changes[0];
    const value = change.value;

    if (value.statuses && value.statuses.length > 0) {
      const status = value.statuses[0];
      
      await Message.findOneAndUpdate(
        { messageId: status.id },
        { status: status.status },
        { new: true }
      );
      
      console.log(`Status updated for message ${status.id}: ${status.status}`);
      
      // Emit status update to connected clients
      io.emit('statusUpdate', { messageId: status.id, status: status.status });
    }
  } catch (error) {
    console.error('Error processing status update:', error);
  }
}

// API Routes

// Get all conversations (grouped by wa_id)
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$waId',
          userName: { $first: '$userName' },
          lastMessage: { $first: '$messageBody' },
          lastMessageTime: { $first: '$timestamp' },
          messageCount: { $sum: 1 }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages for a specific conversation
app.get('/api/conversations/:waId/messages', async (req, res) => {
  try {
    const { waId } = req.params;
    const messages = await Message.find({ waId })
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send a new message
app.post('/api/conversations/:waId/messages', async (req, res) => {
  try {
    const { waId } = req.params;
    const { messageBody, userName } = req.body;

    const messageData = {
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      waId,
      userName: userName || 'Business',
      messageBody,
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
      from: process.env.BUSINESS_PHONE_NUMBER || '918329446654',
      conversationId: `conv_${waId}`
    };

    const newMessage = new Message(messageData);
    await newMessage.save();

    // Emit to connected clients
    io.emit('newMessage', messageData);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user info
app.get('/api/users/:waId', async (req, res) => {
  try {
    const { waId } = req.params;
    const user = await Message.findOne({ waId }).select('userName waId');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      name: user.userName,
      phoneNumber: user.waId,
      isOnline: false // Mock data
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============= NEW PAYLOAD PROCESSING API ROUTES =============

// Process all payload files manually
app.post('/api/payloads/process', payloadRoutes.processPayloads);

// Get all processed messages with pagination
app.get('/api/payloads/messages', payloadRoutes.getProcessedMessages);

// Get messages by conversation ID
app.get('/api/payloads/conversations/:conversationId/messages', payloadRoutes.getConversationMessages);

// Update message status
app.put('/api/payloads/messages/:messageId/status', payloadRoutes.updateMessageStatus);

// Get processing summary
app.get('/api/payloads/summary', payloadRoutes.getProcessingSummary);

// Bulk update message statuses
app.post('/api/payloads/messages/bulk-update-status', payloadRoutes.bulkUpdateStatuses);

// ============= END PAYLOAD PROCESSING ROUTES =============

// Initialize data from JSON files on server start
setTimeout(() => {
  processWebhookPayloads();
}, 2000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
