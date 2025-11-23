const getApiUrl = (): string => {
  // Use custom environment variable for deployment vs development
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  if (env === 'deployment') {
    return 'https://sharelystbackend.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
