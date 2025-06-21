// 실제 백엔드 API와 통신하는 함수들
const getApiBase = () => {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서는 API 서버가 별도 도메인일 수 있음
    return process.env.REACT_APP_API_URL || 'https://sylph611.com';
  }
  
  // 개발 환경에서는 현재 호스트의 포트를 사용하거나 127.0.0.1 사용
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // 로컬 개발 환경에서는 proxy 사용 (상대 경로)
    return '';
  }
  
  // 다른 환경에서는 127.0.0.1 사용
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
};

const API_BASE = getApiBase();

// Mock 데이터 (API 서버가 없을 때 사용)
const mockData = {
  login: { token: 'mock-token-123', user: { id: 1, email: 'test@example.com', name: '테스트 사용자' } },
  properties: [
    { id: 1, title: '강남 아파트', address: '서울시 강남구', price: '10억', date: '2024-01-15', rating: 4.5, status: '관심' },
    { id: 2, title: '홍대 원룸', address: '서울시 마포구', price: '5000만원', date: '2024-01-10', rating: 3.8, status: '방문예정' }
  ]
};

// API 호출 공통 함수
const apiCall = async (endpoint, options = {}) => {
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;
  console.log('API Call:', url, 'Environment:', process.env.NODE_ENV, 'Base:', API_BASE); // 디버깅용
  
  // Mock 모드 체크 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true') {
    console.log('Using mock data for:', endpoint);
    await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
    
    if (endpoint === '/api/login') {
      return mockData.login;
    } else if (endpoint === '/api/properties') {
      return mockData.properties;
    }
  }
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`API 호출 실패 (${res.status}): ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('API Call Error:', error);
    
    // 개발 환경에서 API 서버가 없을 때 mock 데이터 사용
    if (process.env.NODE_ENV === 'development' && error.message.includes('Failed to fetch')) {
      console.log('API 서버 연결 실패, mock 데이터 사용');
      if (endpoint === '/api/login') {
        return mockData.login;
      } else if (endpoint === '/api/properties') {
        return mockData.properties;
      }
    }
    
    throw error;
  }
};

export const api = {
  login: async (email, password) => {
    return apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  getPropertyList: async (token) => {
    return apiCall('/api/properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  getPropertyDetail: async (id, token) => {
    return apiCall(`/api/properties/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  createProperty: async (propertyData, token) => {
    return apiCall('/api/properties', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(propertyData)
    });
  },

  updateProperty: async (id, data, token) => {
    return apiCall(`/api/properties/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
  },

  deleteProperty: async (id, token) => {
    return apiCall(`/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};