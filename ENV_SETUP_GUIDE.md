# Environment Variables Configuration

This document describes all the environment variables used in the WhatsApp Web Clone application for both server and client sides.

## Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

### Required Variables

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=whatsapp

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000

# WhatsApp Business Configuration
BUSINESS_PHONE_NUMBER=918329446654
DISPLAY_PHONE_NUMBER=918329446654

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=http://localhost:3000
```

### Environment Variable Descriptions

- **MONGODB_URI**: MongoDB connection string with credentials
- **DB_NAME**: Database name to use (default: whatsapp)
- **PORT**: Server port (default: 5000)
- **NODE_ENV**: Environment mode (development/production)
- **CLIENT_URL**: Frontend application URL for CORS
- **BUSINESS_PHONE_NUMBER**: WhatsApp Business phone number
- **DISPLAY_PHONE_NUMBER**: Display phone number for UI
- **SOCKET_CORS_ORIGIN**: Socket.IO CORS origin URL

## Client Environment Variables

Create a `.env` file in the `client` directory with the following variables:

### Required Variables

```env
# Client Configuration
REACT_APP_SERVER_URL=http://localhost:5000
REACT_APP_API_BASE_URL=/api

# Socket.IO Configuration
REACT_APP_SOCKET_URL=http://localhost:5000

# Development Configuration
REACT_APP_ENV=development

# External APIs
REACT_APP_AVATAR_API_URL=https://ui-avatars.com/api

# Port Configuration (if running client on different port)
PORT=3000
```

### Environment Variable Descriptions

- **REACT_APP_SERVER_URL**: Backend server URL
- **REACT_APP_API_BASE_URL**: API endpoints base path
- **REACT_APP_SOCKET_URL**: Socket.IO server URL
- **REACT_APP_ENV**: Environment mode
- **REACT_APP_AVATAR_API_URL**: External avatar generation service
- **PORT**: React development server port

## Security Best Practices

### 1. Never Commit Sensitive Data
- MongoDB credentials
- API keys
- Phone numbers
- Any production URLs or configurations

### 2. Use Different Values for Different Environments
```env
# Development
MONGODB_URI=mongodb://localhost:27017/whatsapp-dev
CLIENT_URL=http://localhost:3000

# Production
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/
CLIENT_URL=https://your-domain.com
```

### 3. Validate Environment Variables
The application includes validation to ensure required environment variables are present:

```javascript
if (!MONGODB_URI) {
  console.error('MongoDB URI is not defined in environment variables');
  process.exit(1);
}
```

## Setup Instructions

### 1. Server Setup
```bash
cd server
cp .env.example .env  # If you have an example file
# Edit .env with your actual values
npm install
npm start
```

### 2. Client Setup
```bash
cd client
cp .env.example .env  # If you have an example file
# Edit .env with your actual values
npm install
npm start
```

### 3. Development vs Production

#### Development Configuration
- Use localhost URLs
- Use development database
- Enable detailed logging
- Allow CORS for local development

#### Production Configuration
- Use production domain URLs
- Use production database with proper credentials
- Minimize logging
- Restrict CORS to specific domains
- Use HTTPS URLs

## Environment Files Structure

```
project-root/
├── server/
│   ├── .env                 # Server environment variables
│   ├── .env.example         # Example server environment file
│   └── .gitignore           # Excludes .env files
├── client/
│   ├── .env                 # Client environment variables
│   ├── .env.example         # Example client environment file
│   └── .gitignore           # Excludes .env files
```

## Common Issues and Solutions

### 1. MongoDB Connection Issues
- Verify MONGODB_URI is correct
- Check network connectivity
- Ensure database user has proper permissions

### 2. CORS Issues
- Verify CLIENT_URL matches your frontend URL
- Check SOCKET_CORS_ORIGIN is set correctly

### 3. API Connection Issues
- Ensure REACT_APP_SERVER_URL points to running server
- Check if server port matches PORT environment variable

### 4. Environment Variables Not Loading
- Ensure .env file is in correct directory
- Restart development servers after changing .env
- Check for typos in variable names (case-sensitive)

## Migration from Hardcoded Values

Previously hardcoded values that are now configurable:

### Server Side
- ❌ `'mongodb+srv://venky:Venky8086@sadist.3robl.mongodb.net/'`
- ✅ `process.env.MONGODB_URI`

- ❌ `'http://localhost:3000'`
- ✅ `process.env.CLIENT_URL`

- ❌ `'918329446654'`
- ✅ `process.env.BUSINESS_PHONE_NUMBER`

### Client Side
- ❌ `'http://localhost:5000'`
- ✅ `config.socket.url`

- ❌ `'/api/conversations'`
- ✅ `config.api.baseUrl + '/conversations'`

- ❌ `'https://ui-avatars.com/api'`
- ✅ `config.external.avatarApiUrl`

## Environment Variable Naming Conventions

### Server Variables
- Use SCREAMING_SNAKE_CASE
- Group related variables with prefixes
- Be descriptive and clear

### Client Variables (React)
- Must start with `REACT_APP_`
- Use SCREAMING_SNAKE_CASE after prefix
- Group by functionality

This configuration ensures better security, maintainability, and deployment flexibility.
