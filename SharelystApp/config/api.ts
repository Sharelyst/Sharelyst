const getApiUrl = (): string => {
  // Use custom environment variable for deployment vs development
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  if (env === 'deployment') {
    return 'https://sharelystbackend.onrender.com/api';
  }
  
  // For development:
  // IP address is automatically updated by scripts/update-ip.js
  // Run 'npm start' to auto-detect your computer's IP
  return 'http://172.20.10.2:3000/api';
};

// Fallback URLs to try if the primary URL fails
export const FALLBACK_API_URLS = [
  'http://10.24.136.50:3000/api',
  'http://172.20.10.2:3000/api',
  'http://10.0.2.2:3000/api',      
  'http://192.168.2.19:3000/api',  
  'http://127.0.0.1:3000/api',     
];

export const API_URL = getApiUrl();

// Function to check connectivity with backend
export async function checkBackendConnectivity(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/ping`);
    if (!response.ok) {
      return { success: false, message: `HTTP error: ${response.status}` };
    }
    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Unknown error' };
  }
}
