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

export default api;
export { API_URL };
