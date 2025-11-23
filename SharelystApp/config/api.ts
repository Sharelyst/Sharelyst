const getApiUrl = (): string => {
  // Use custom environment variable for deployment vs development
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  if (env === 'deployment') {
    return 'https://sharelystbackend.onrender.com/api';
  }
  
  // For development:
  // Use your computer's actual IP address
  // This works for physical devices and most emulators
  return 'http://192.168.2.19:3000/api';
};

// Fallback URLs to try if the primary URL fails
export const FALLBACK_API_URLS = [
  'http://10.0.2.2:3000/api',      // Android Emulator
  'http://192.168.2.19:3000/api',  // Your computer's local IP
  'http://127.0.0.1:3000/api',     // Alternative localhost
];

export const API_URL = getApiUrl();
