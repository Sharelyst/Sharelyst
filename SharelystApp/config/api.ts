const getApiUrl = (): string => {
  // Use custom environment variable for deployment vs development
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  if (env === 'deployment') {
    return 'https://sharelystbackend.onrender.com/api';
  }
  
  // For development:
  // IP address is automatically updated by scripts/update-ip.js
  // Run 'npm start' to auto-detect your computer's IP
  return 'http://192.168.2.19:3000/api';
};

// Fallback URLs to try if the primary URL fails
export const FALLBACK_API_URLS = [
  'http://10.0.2.2:3000/api',      
  'http://192.168.2.19:3000/api',  
  'http://127.0.0.1:3000/api',     
];

export const API_URL = getApiUrl();
