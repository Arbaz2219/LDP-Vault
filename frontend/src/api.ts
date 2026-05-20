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
      // Only clear session if we actually had a token stored
      // (avoids redirect loop on the login page itself)
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('masterPassword');
        // Hard reload brings React Router back to the login route
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
