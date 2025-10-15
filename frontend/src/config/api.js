// frontend/src/config/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const getApiUrl = (endpoint) => {
  // Remove any leading/trailing slashes for consistency
  const base = API_BASE.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};

export default API_BASE;