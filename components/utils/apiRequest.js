// Common API request utility
// Get API base URL from environment variable, fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://bt-backend.ntgen1.in';

export default async function apiRequest({ endpoint, method = 'GET', payload = null, params = null }) {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  if (params && typeof params === 'object') {
    const query = new URLSearchParams(params).toString();
    url += (url.includes('?') ? '&' : '?') + query;
  }
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists (except for login/token endpoints)
  const token = localStorage.getItem('token');
  if (token && !endpoint.includes('/token/') && !endpoint.includes('/auth/')) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(payload);
  }
  
  const res = await fetch(url, options);
  
  if (!res.ok) {
    // Handle 401 Unauthorized - clear token and redirect to login
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch a custom event to notify the AuthContext
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout', { 
          detail: { reason: 'token_expired' } 
        }));
      }
      
      // Only redirect if we're not already on the login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw { detail: 'Session expired. Please login again.' };
    }
    
    // Try to get error details from response
    let errorData;
    try {
      errorData = await res.json();
    } catch (e) {
      errorData = { detail: `HTTP ${res.status}: ${res.statusText}` };
    }
    
    throw errorData;
  }
  
  if (res.status === 204) return null; // No Content
  
  const data = await res.json();
  return data;
} 