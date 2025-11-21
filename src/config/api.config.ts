// Konfigurasi API endpoint
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api'  // Development
    : 'https://your-production-api.com/api',  // Production
  
  ENDPOINTS: {
    USERS: '/users',
    USER_BY_ID: (id: string) => `/users/${id}`,
  },
  
  TIMEOUT: 10000, // 10 seconds
};