// frontend/src/config/api.js
// For API endpoints
const API_BASE = process.env.REACT_APP_API_URL || `${window.location.origin}/api`;
// For direct PDF access
const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

export const getApiUrl = (endpoint) => {
  // Remove any leading/trailing slashes for consistency
  const base = API_BASE.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};

export const getPdfUrl = (endpoint) => {
  // For PDF endpoints that don't need the /api prefix
  const base = BASE_URL.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};

export default API_BASE;