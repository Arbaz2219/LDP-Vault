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

// Global response interceptor: if the server returns 401 or 403,
// the JWT is missing or has expired. Clear local storage and reload
// so the user is redirected to login cleanly.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Only clear and redirect if we're not already on the login page
      // and if we actually have a session to clear.
      if (!window.location.pathname.includes('/login') && localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('masterPassword');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
