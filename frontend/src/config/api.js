// frontend/src/config/api.js
// Use environment variables with fallback to relative paths for production
const API_BASE = process.env.NODE_ENV === 'production'
  ? `${window.location.protocol}//${window.location.host}/api`
  : process.env.REACT_APP_API_URL || '/api';

const BASE_URL = process.env.REACT_APP_BASE_URL || window.location.origin;

// Helper function to construct API URLs
const createUrl = (base, endpoint) => {
  let cleanBase = base.replace(/\/+$/, '');
  if (process.env.NODE_ENV === 'production' && cleanBase.startsWith('http://')) {
    cleanBase = 'https' + cleanBase.substring(4);
  }
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
  NODE_ENV: process.env.NODE_ENV,
  sampleApiUrl: getApiUrl('clients/'),
  samplePdfUrl: getPdfUrl('pdf/some-file.pdf')
});