// 실제 백엔드 API와 통신하는 함수들
const getApiBase = () => {
  if (process.env.NODE_ENV === 'production') {
    return 'https://sylph611.com';
  }
  
  // 개발 환경에서는 환경 변수나 기본값 사용
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
};

const API_BASE = getApiBase();

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('로그인 실패');
    return await res.json();
  },

  getPropertyList: async (token) => {
    const res = await fetch(`${API_BASE}/api/properties`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('매물 목록 조회 실패');
    return await res.json();
  },

  getPropertyDetail: async (id, token) => {
    const res = await fetch(`${API_BASE}/api/properties/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('매물 상세 조회 실패');
    return await res.json();
  },

  createProperty: async (propertyData, token) => {
    const res = await fetch(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(propertyData)
    });
    if (!res.ok) throw new Error('매물 등록 실패');
    return await res.json();
  },

  updateProperty: async (id, data, token) => {
    const res = await fetch(`${API_BASE}/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server response:', res.status, errorText);
      throw new Error(`수정 실패 (${res.status}): ${errorText}`);
    }
    return await res.json();
  },

  deleteProperty: async (id, token) => {
    const res = await fetch(`${API_BASE}/api/properties/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('삭제 실패');
  }
};