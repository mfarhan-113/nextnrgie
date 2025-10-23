import axios from 'axios';
// frontend/src/config/api.js
// Force HTTPS in production
const isProduction = process.env.NODE_ENV === 'production';
const currentProtocol = window.location.protocol;
const currentHost = window.location.host;

// Base URL configuration
const API_BASE = isProduction
  ? `https://${currentHost}/api/`  // Always use HTTPS in production (trailing slash is critical)
  : process.env.REACT_APP_API_URL || '/api';

const BASE_URL = isProduction
  ? `https://${currentHost}`  // Always use HTTPS in production
  : process.env.REACT_APP_BASE_URL || window.location.origin;

const ensureHttps = (url) => {
  if (!isProduction || !url) return url;
  return url.replace(/^http:/, 'https:');
};

// Helper function to construct API URLs
const createUrl = (base, endpoint) => {
  // Ensure base URL is clean and uses HTTPS in production
  let cleanBase = base.replace(/\/+$/, '');
  if (isProduction && cleanBase.startsWith('http://')) {
    cleanBase = 'https' + cleanBase.substring(4);
  }
  
  // Handle endpoint formatting
  const cleanPath = (endpoint || '').replace(/^\/+/, '');
  let finalUrl = cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
  
  // Ensure the final URL has a trailing slash for API endpoints
  if (isProduction && !finalUrl.endsWith('/') && 
      (finalUrl.includes('/api/') || finalUrl.endsWith('/api'))) {
    finalUrl += '/';
  }
  
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

const defaultHeaders = {
  'Content-Type': 'application/json',
};
if (isProduction) {
  defaultHeaders['X-Forwarded-Proto'] = 'https';
  defaultHeaders['X-Forwarded-Host'] = currentHost;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: defaultHeaders,
});

api.interceptors.request.use((config) => {
  if (isProduction) {
    // Always force baseURL to our HTTPS API_BASE in production
    config.baseURL = ensureHttps(API_BASE);
    // Upgrade any accidental absolute http URLs
    if (typeof config.url === 'string') {
      config.url = ensureHttps(config.url);
    }
    try {
      // Compute final URL for logging
      const finalUrl = new URL(
        typeof config.url === 'string' ? config.url : '',
        config.baseURL || API_BASE
      ).toString();
      console.log('[API REQUEST]', {
        method: (config.method || 'get').toUpperCase(),
        finalUrl
      });
    } catch (_) {
      // no-op
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (isProduction) {
      try {
        const responseURL = response?.request?.responseURL || '';
        if (responseURL) {
          console.log('[API RESPONSE]', {
            status: response.status,
            responseURL
          });
        }
      } catch (_) {}
    }
    return response;
  },
  (error) => {
    if (isProduction) {
      try {
        const responseURL = error?.request?.responseURL || '';
        console.warn('[API ERROR]', {
          message: error?.message,
          code: error?.code,
          responseURL
        });
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);

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

// Runtime safety net: upgrade any accidental http fetch/XHR to https in production
if (isProduction) {
  try {
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      if (typeof input === 'string' && input.startsWith('http://')) {
        const upgraded = input.replace(/^http:\/\//, 'https://');
        console.warn('[FETCH UPGRADE]', { from: input, to: upgraded });
        input = upgraded;
      }
      return originalFetch.call(this, input, init);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      if (typeof url === 'string' && url.startsWith('http://')) {
        const upgraded = url.replace(/^http:\/\//, 'https://');
        console.warn('[XHR UPGRADE]', { from: url, to: upgraded });
        url = upgraded;
      }
      return originalOpen.call(this, method, url, async, user, password);
    };
  } catch (_) {
    // no-op
  }
}

export default api;