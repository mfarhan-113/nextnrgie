// frontend/src/config/api.js
// Use environment variables with fallback to relative paths for production
const API_BASE = process.env.REACT_APP_API_URL || '/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

// Helper function to construct API URLs
const createUrl = (base, endpoint) => {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = (endpoint || '').replace(/^\/+/, '');
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
};

export const getApiUrl = (endpoint) => {
  return createUrl(API_BASE, endpoint);
};

export const getPdfUrl = (endpoint) => {
  return createUrl(BASE_URL, endpoint);
};

// Log the API configuration for debugging
console.log('API Configuration:', {
  API_BASE,
  BASE_URL,
  sampleApiUrl: getApiUrl('clients/'),
  samplePdfUrl: getPdfUrl('pdf/some-file.pdf')
});