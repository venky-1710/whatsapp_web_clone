# WhatsApp Payload Processor Documentation

## Overview
This system processes WhatsApp webhook payloads (messages and status updates) and stores them in a MongoDB database. It provides both CLI and API interfaces for managing the data.

## Database Schema
**Database:** `whatsapp`  
**Collection:** `processed_messages`

### Message Document Structure
```javascript
{
  messageId: String,           // Unique WhatsApp message ID
  waId: String,               // WhatsApp ID of sender/recipient
  userName: String,           // Display name of user
  messageBody: String,        // Message content
  timestamp: Date,            // Message timestamp
  status: String,             // 'sent', 'delivered', 'read'
  type: String,               // Message type (text, media, etc.)
  from: String,               // Sender phone number
  conversationId: String,     // Conversation identifier
  meta_msg_id: String,        // Meta message ID (same as messageId)
  payloadId: String,          // Original payload ID
  phoneNumberId: String,      // WhatsApp Business phone number ID
  displayPhoneNumber: String, // Display phone number
  statusHistory: Array,       // Array of status changes
  createdAt: Date,           // Document creation time
  updatedAt: Date            // Last update time
}
```

## Files Created

### 1. `process-payloads.js` - Main Processing Script
The core payload processor that handles:
- Reading JSON payload files from the project directory
- Processing message payloads and inserting into MongoDB
- Processing status updates and updating message statuses
- CLI interface for various operations

#### CLI Usage:
```bash
# Process all payload files
node process-payloads.js process

# Show processing summary
node process-payloads.js summary

# Get all messages (JSON output)
node process-payloads.js messages

# Get messages by conversation ID
node process-payloads.js conversation conv_1_919937320320

# Update message status manually
node process-payloads.js update-status <messageId> delivered
```

### 2. `payload-api-routes.js` - API Route Handlers
Express.js route handlers for HTTP API access:
- POST `/api/payloads/process` - Process all payloads
- GET `/api/payloads/messages` - Get messages with pagination
- GET `/api/payloads/conversations/:id/messages` - Get conversation messages
- PUT `/api/payloads/messages/:id/status` - Update message status
- GET `/api/payloads/summary` - Get processing summary
- POST `/api/payloads/messages/bulk-update-status` - Bulk update statuses

### 3. `test-payloads.js` - Test Suite
Comprehensive test script for both CLI and API functionality.

## API Endpoints

### Process Payloads
```http
POST /api/payloads/process
Content-Type: application/json

Response:
{
  "success": true,
  "message": "Payloads processed successfully",
  "summary": {...}
}
```

### Get Messages (with pagination)
```http
GET /api/payloads/messages?page=1&limit=50

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "totalPages": 2
  }
}
```

### Get Conversation Messages
```http
GET /api/payloads/conversations/conv_1_919937320320/messages

Response:
{
  "success": true,
  "data": [...],
  "conversationId": "conv_1_919937320320"
}
```

### Update Message Status
```http
PUT /api/payloads/messages/wamid.HBg.../status
Content-Type: application/json

{
  "status": "read"
}

Response:
{
  "success": true,
  "message": "Status updated successfully",
  "data": {...}
}
```

### Bulk Update Statuses
```http
POST /api/payloads/messages/bulk-update-status
Content-Type: application/json

{
  "updates": [
    {"messageId": "msg1", "status": "delivered"},
    {"messageId": "msg2", "status": "read"}
  ]
}

Response:
{
  "success": true,
  "message": "Bulk update completed",
  "results": [...]
}
```

## How It Works

### 1. Message Processing Flow
1. **File Discovery**: Scans project directory for JSON files
2. **Message Extraction**: Parses message payloads and extracts relevant data
3. **Database Insert**: Stores messages in `processed_messages` collection
4. **Deduplication**: Prevents duplicate messages using `messageId`

### 2. Status Update Flow
1. **Status Parsing**: Extracts status updates from webhook payloads
2. **Message Matching**: Finds corresponding messages by `messageId` or `meta_msg_id`
3. **Status Update**: Updates message status and adds to status history
4. **Delayed Processing**: Handles status updates for messages not yet processed

### 3. Data Relationships
- **Messages** are grouped by `conversationId`
- **Status updates** are matched to messages by `messageId`
- **History tracking** maintains all status changes with timestamps

## Installation & Setup

### 1. Install Dependencies
```bash
cd server
npm install mongoose dotenv express cors socket.io
```

### 2. Environment Configuration
Create `.env` file in server directory:
```env
MONGODB_URI=mongodb+srv://venky:Venky8086@sadist.3robl.mongodb.net/
PORT=5000
```

### 3. Database Setup
The script automatically:
- Connects to the `whatsapp` database
- Creates the `processed_messages` collection
- Sets up indexes on `messageId` field

## Usage Examples

### Processing Payloads
```bash
# Direct CLI processing
cd server
node process-payloads.js process

# Via API (requires server running)
curl -X POST http://localhost:5000/api/payloads/process
```

### Querying Data
```bash
# Get conversation messages
node process-payloads.js conversation conv_1_919937320320

# Via API
curl http://localhost:5000/api/payloads/conversations/conv_1_919937320320/messages
```

### Updating Statuses
```bash
# CLI update
node process-payloads.js update-status wamid.HBg... read

# API update
curl -X PUT http://localhost:5000/api/payloads/messages/wamid.HBg.../status \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
```

## Testing

### Run Test Suite
```bash
# Test CLI functionality
node test-payloads.js

# Test API endpoints (server must be running)
node test-payloads.js api
```

### Start Server for API Testing
```bash
# Terminal 1: Start server
node server.js

# Terminal 2: Run API tests
node test-payloads.js api
```

## Integration with Existing Server

The payload processor is integrated into the existing `server.js` with:
- New API routes under `/api/payloads/*`
- Shared MongoDB connection using `whatsapp` database
- Maintains backward compatibility with existing routes

## Features

### ✅ Implemented
- [x] Read all JSON payload files automatically
- [x] Insert messages into MongoDB with deduplication
- [x] Process status updates and match to existing messages
- [x] CLI interface for all operations
- [x] REST API for web integration
- [x] Pagination for large datasets
- [x] Bulk operations for efficiency
- [x] Status history tracking
- [x] Comprehensive error handling
- [x] Database connection management

### 🔄 Additional Features Available
- Real-time processing via webhooks
- Message search and filtering
- Analytics and reporting
- Export/import functionality
- Message archiving
- Performance monitoring

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MONGODB_URI in .env file
   - Verify network connectivity
   - Ensure database credentials are correct

2. **Payload Files Not Found**
   - Ensure JSON files are in project root directory
   - Check file naming conventions (must include 'message' or 'status')

3. **Status Updates Not Working**
   - Verify messageId matches between message and status payloads
   - Check that messages are processed before status updates

4. **API Endpoints Not Responding**
   - Ensure server is running on correct port
   - Check for middleware conflicts
   - Verify route registration order

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=payload-processor node process-payloads.js process
```

## Security Considerations

- Validate all input data before database operations
- Implement rate limiting for API endpoints
- Use proper MongoDB connection string security
- Sanitize user inputs to prevent injection attacks
- Consider implementing authentication for sensitive operations

## Performance Optimization

- Indexes are automatically created on frequently queried fields
- Bulk operations minimize database round trips
- Pagination prevents memory overflow with large datasets
- Connection pooling manages database resources efficiently
