// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>;
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Add query parameters
  if (params) {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();
    url += `?${queryString}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
    throw new Error(error.message || 'Có lỗi xảy ra');
  }

  return response.json();
}

// Analytics APIs
export const analyticsAPI = {
  getStats: () => fetchAPI('/analytics/stats'),
  getFeedbackSummary: () => fetchAPI('/analytics/feedback-summary'),
  getOverview: () => fetchAPI('/analytics/overview')
};

// Tutor APIs
export const tutorAPI = {
  getAll: (page = 1, limit = 10) => 
    fetchAPI('/tutors', { params: { page, limit } }),
  getById: (id: string) => fetchAPI(`/tutors/${id}`),
  create: (data: any) => 
    fetchAPI('/tutors', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    fetchAPI(`/tutors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/tutors/${id}`, { method: 'DELETE' }),
};

// Student APIs
export const studentAPI = {
  getAll: (page = 1, limit = 10) => 
    fetchAPI('/students', { params: { page, limit } }),
  getById: (id: string) => fetchAPI(`/students/${id}`),
  create: (data: any) => 
    fetchAPI('/students', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => 
    fetchAPI(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => 
    fetchAPI(`/students/${id}`, { method: 'DELETE' }),
};

// Reports API
export const reportsAPI = {
  getTypes: () => 
    apiCall('/reports/types'),
  
  generate: (reportTypes: string[], filters?: any) => 
    apiCall('/reports/generate', {
      method: 'POST',
      body: JSON.stringify({ reportTypes, filters }),
    }),
  
  getHistory: (page = 1, limit = 10) => 
    apiCall(`/reports/history?page=${page}&limit=${limit}`),
  
  getById: (id: string) => 
    apiCall(`/reports/${id}`),
  
  delete: (id: string) => 
    apiCall(`/reports/${id}`, {
      method: 'DELETE',
    }),
};

export default fetchAPI;