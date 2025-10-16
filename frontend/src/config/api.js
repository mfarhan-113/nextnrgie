// frontend/src/config/api.js
const API_BASE = process.env.REACT_APP_API_URL || '';
const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;
export const getApiUrl = (endpoint) => {
  const base = API_BASE.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};

export const getPdfUrl = (endpoint) => {
  const base = BASE_URL.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}`;
};