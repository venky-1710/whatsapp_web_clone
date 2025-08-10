# WhatsApp Web Clone

A full-stack MERN application that replicates WhatsApp Web functionality, featuring real-time messaging, webhook payload processing, and a responsive UI.

## 🚀 Features

- **Real-time Messaging**: Live chat with Socket.IO integration
- **WhatsApp-like UI**: Responsive design mimicking WhatsApp Web
- **Message Status**: Sent, delivered, and read status indicators
- **Webhook Processing**: Processes WhatsApp Business API webhook payloads
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **MongoDB Integration**: Persistent data storage
- **Contact Management**: User profiles with avatars and status

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **CORS** for cross-origin requests

### Frontend
- **React** (functional components with hooks)
- **Socket.IO Client** for real-time updates
- **CSS3** with custom styling (no Tailwind)
- **Responsive Design** for mobile and desktop

## 📁 Project Structure

```
whatsapp_web_clone/
├── server/
│   ├── server.js              # Main server file
│   ├── package.json           # Server dependencies
│   ├── .env                   # Environment variables
│   └── MONGODB_SETUP.md       # Database setup guide
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConversationList.js    # Chat list sidebar
│   │   │   ├── ChatWindow.js          # Main chat interface
│   │   │   ├── Welcome.js             # Landing screen
│   │   │   └── *.css                  # Component styles
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # App styles
│   │   └── index.css          # Global styles
│   └── package.json           # Client dependencies
└── *.json                     # Sample webhook payloads
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd whatsapp_web_clone
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up MongoDB:**
   - **Local MongoDB**: Follow instructions in `server/MONGODB_SETUP.md`
   - **MongoDB Atlas**: Update `.env` file with your connection string

5. **Configure environment variables:**
   ```bash
   cd ../server
   # Edit .env file with your MongoDB connection string
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm run dev
   # Server runs on http://localhost:5000
   ```

2. **Start the frontend client:**
   ```bash
   cd client
   npm start
   # Client runs on http://localhost:3000
   ```

3. **Access the application:**
   - Open http://localhost:3000 in your browser
   - The app will automatically load sample conversations

## 🔧 API Endpoints

### Conversations
- `GET /api/conversations` - Get all conversations
- `GET /api/conversations/:waId/messages` - Get messages for a conversation
- `POST /api/conversations/:waId/messages` - Send a new message

### Users
- `GET /api/users/:waId` - Get user information

## 📱 Features Implemented

### Task 1: Webhook Payload Processor ✅
- ✅ Reads JSON webhook payloads
- ✅ Inserts messages into MongoDB `processed_messages` collection
- ✅ Updates message status using `id` field
- ✅ Processes both message and status payloads

### Task 2: WhatsApp Web Interface ✅
- ✅ Clean, responsive UI similar to WhatsApp Web
- ✅ Conversations grouped by user (`wa_id`)
- ✅ Message bubbles with timestamps
- ✅ Status indicators (sent ✓, delivered ✓✓, read ✓✓ blue)
- ✅ User info display
- ✅ Mobile-responsive design

### Task 3: Send Message Feature ✅
- ✅ Message input with send button
- ✅ Messages appear in conversation UI
- ✅ Messages saved to database
- ✅ Real-time updates without page refresh

### Bonus: Real-time WebSocket ✅
- ✅ Socket.IO implementation
- ✅ Real-time message updates
- ✅ Live status updates
- ✅ No manual refresh required

## 🎨 Design Features

- **WhatsApp-accurate color scheme**: Dark theme with authentic colors
- **Message bubbles**: Proper styling for incoming/outgoing messages
- **Status icons**: Authentic checkmark designs
- **Contact avatars**: Circular avatars with initials
- **Responsive layout**: Seamless mobile and desktop experience
- **Smooth transitions**: Hover effects and animations

## 📊 Database Schema

### Messages Collection (`processed_messages`)
```javascript
{
  messageId: String,      // Unique WhatsApp message ID
  waId: String,          // WhatsApp ID (phone number)
  userName: String,      // Contact name
  messageBody: String,   // Message content
  timestamp: Date,       // Message timestamp
  status: String,        // 'sent', 'delivered', 'read'
  type: String,          // Message type (text)
  from: String,          // Sender phone number
  conversationId: String // Conversation identifier
}
```

## 🌐 Live Demo

The application supports:
- **Desktop**: Full WhatsApp Web experience
- **Mobile**: Touch-optimized interface with back navigation
- **Real-time**: Live message and status updates
- **Responsive**: Adapts to all screen sizes

## 🔒 Security Features

- CORS configuration for secure API access
- Input validation for message sending
- Environment variable protection for sensitive data

## 🚀 Deployment Ready

The application is configured for easy deployment on:
- **Vercel** (Frontend)
- **Render/Heroku** (Backend)
- **MongoDB Atlas** (Database)

## 📝 Sample Data

The application includes sample conversations:
- **Ravi Kumar** (919937320320)
- **Neha Joshi** (929967673820)

With realistic message exchanges and status updates.

## 🔧 Development Commands

```bash
# Server development
npm run dev          # Start with nodemon
npm start           # Start production server

# Client development  
npm start           # Start React dev server
npm run build       # Build for production
```

## 📞 Contact

This WhatsApp Web clone demonstrates modern full-stack development with real-time features, responsive design, and webhook integration suitable for business messaging platforms.
