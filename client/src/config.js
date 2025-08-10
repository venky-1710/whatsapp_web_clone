// Configuration for API endpoints and environment variables
const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || '/api',
    serverUrl: process.env.REACT_APP_SERVER_URL || 'https://whatsapp-web-clone-q4ud.onrender.com'
  },
  socket: {
    url: process.env.REACT_APP_SOCKET_URL || 'https://whatsapp-web-clone-q4ud.onrender.com'
  },
  external: {
    avatarApiUrl: process.env.REACT_APP_AVATAR_API_URL || 'https://ui-avatars.com/api'
  },
  env: process.env.REACT_APP_ENV || 'development'
};

export default config;
