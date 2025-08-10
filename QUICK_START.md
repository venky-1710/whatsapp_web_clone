# WhatsApp Web Clone - Quick Start Guide

## 🚀 Quick Setup (Development)

### Prerequisites Check
- ✅ Node.js (v14+)
- ✅ npm/yarn
- ✅ MongoDB (local or Atlas)

### 1. Install Dependencies
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies  
cd ../client && npm install
```

### 2. Configure Database
Edit `server/.env`:
```
# For local MongoDB
MONGODB_URI=mongodb://localhost:27017/whatsapp

# For MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/whatsapp
```

### 3. Start Applications
```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
cd client && npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🎯 Testing the Application

1. **View Conversations**: Should see Ravi Kumar and Neha Joshi
2. **Click on a conversation**: View message history
3. **Send a message**: Type and press Enter/Send
4. **Check status indicators**: ✓ (sent), ✓✓ (delivered), ✓✓ (read - blue)
5. **Real-time updates**: Open multiple browser tabs to test

## 📱 Mobile Testing
- Open http://localhost:3000 on mobile device
- Test responsive layout and touch interactions

## 🔧 Production Deployment

### Backend (Render/Heroku)
1. Set environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `PORT`: Auto-assigned by platform
   - `NODE_ENV`: production

### Frontend (Vercel)
1. Update API endpoints to production backend URL
2. Build: `npm run build`
3. Deploy build folder

### Database (MongoDB Atlas)
1. Create cluster and database
2. Whitelist deployment IPs
3. Update connection string

## 🐛 Troubleshooting

### Common Issues:
1. **MongoDB Connection Error**: Check MongoDB service or Atlas connection
2. **CORS Error**: Verify backend URL in frontend
3. **Socket Connection Failed**: Check port 5000 availability
4. **Build Errors**: Clear node_modules and reinstall

### Debug Commands:
```bash
# Check MongoDB status
mongo --eval "db.adminCommand('ismaster')"

# Test API endpoints
curl http://localhost:5000/api/conversations

# View server logs
npm run dev # in server directory
```

## ✅ Feature Checklist

- ✅ Webhook payload processing
- ✅ Real-time messaging with Socket.IO
- ✅ WhatsApp-like responsive UI
- ✅ Message status indicators
- ✅ Mobile-responsive design
- ✅ Conversation management
- ✅ MongoDB integration
- ✅ Send message functionality
- ✅ User profiles with avatars

## 📊 Sample Data Loaded
- 2 conversations with 4 messages total
- Status updates for all messages
- Realistic timestamps and user data

---

🎉 **Your WhatsApp Web Clone is ready!**

Open http://localhost:3000 and start chatting!
