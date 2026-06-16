import axios from 'axios';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Automatically route to the api subdomain for the current host
  return `https://api-${hostname}`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL
});

// Global request interceptor: automatically attach the token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor: if the server returns 401 or 403,
// the JWT is missing or has expired. Clear local storage and reload
// so the user is redirected to login cleanly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    if (status === 401 || status === 403) {
      console.warn(`[API] Authorization failed (${status}) for request: ${url}`);
      
      const token = localStorage.getItem('token');
      const hasToken = !!token;
      const isActuallyAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

      // Only redirect if we ARE NOT on login/vault-lock AND we think we should be authenticated
      const currentPath = window.location.pathname;
      const shouldBeAtLogin = currentPath.includes('/login') || currentPath.includes('/vault-lock');

      console.log('[API] Check:', { currentPath, shouldBeAtLogin, hasToken, isActuallyAuthenticated });

      if (!shouldBeAtLogin && (hasToken || isActuallyAuthenticated)) {
        console.error('[API] Active session rejected. Clearing state and redirecting to login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('masterPassword');
        
        // Use a flag to avoid multiple reloads
        if (!window.sessionStorage.getItem('auth_redirect_in_progress')) {
          window.sessionStorage.setItem('auth_redirect_in_progress', 'true');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
