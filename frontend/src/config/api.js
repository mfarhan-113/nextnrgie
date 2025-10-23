// frontend/src/config/api.js
// Force HTTPS in production
const isProduction = process.env.NODE_ENV === 'production';
const currentProtocol = window.location.protocol;
const currentHost = window.location.host;

// Base URL configuration
const API_BASE = isProduction
  ? `https://${currentHost}/api`  // Always use HTTPS in production
  : process.env.REACT_APP_API_URL || '/api';

const BASE_URL = isProduction
  ? `https://${currentHost}`  // Always use HTTPS in production
  : process.env.REACT_APP_BASE_URL || window.location.origin;

// Helper function to construct API URLs
const createUrl = (base, endpoint) => {
  let cleanBase = base.replace(/\/+$/, '');
  // Ensure HTTPS in production
  if (isProduction && cleanBase.startsWith('http://')) {
    cleanBase = 'https' + cleanBase.substring(4);
  }
  const cleanPath = (endpoint || '').replace(/^\/+/, '');
  const finalUrl = cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
  
  // Log URL generation for debugging
  if (isProduction) {
    console.log(`Generated URL for ${endpoint || 'base'}:`, finalUrl);
  }
  
  return finalUrl;
};

export const getApiUrl = (endpoint) => {
  const url = createUrl(API_BASE, endpoint);
  if (isProduction) {
    console.log(`API URL for ${endpoint}:`, url);
  }
  return url;
};

export const getPdfUrl = (endpoint) => {
  const url = createUrl(BASE_URL, endpoint);
  if (isProduction) {
    console.log(`PDF URL for ${endpoint}:`, url);
  }
  return url;
};

// Log the API configuration for debugging
console.log('API Configuration:', {
  isProduction,
  currentProtocol,
  currentHost,
  API_BASE,
  BASE_URL,
  sampleApiUrl: getApiUrl('clients/'),
  samplePdfUrl: getPdfUrl('pdf/some-file.pdf')
});