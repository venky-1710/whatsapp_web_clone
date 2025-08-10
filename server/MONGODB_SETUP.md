# MongoDB Setup Instructions

## Option 1: Local MongoDB Installation

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB following the installation wizard
3. Start MongoDB service:
   - Open Services (services.msc)
   - Find "MongoDB Server" and start it
   OR
   - Run `mongod` in command prompt

### Alternative: Use MongoDB in Docker
```powershell
docker run --name whatsapp-mongo -d -p 27017:27017 mongo:latest
```

## Option 2: MongoDB Atlas (Cloud Database)

1. Create a free account at: https://www.mongodb.com/atlas/database
2. Create a new cluster (Free Tier M0)
3. Create a database user with username/password
4. Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
5. Get your connection string and update the .env file:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/whatsapp?retryWrites=true&w=majority
```

## Current Configuration
The server is configured to use: `mongodb://localhost:27017/whatsapp`

Update the .env file in the server directory to change the database connection.
