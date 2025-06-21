// 실제 백엔드 API와 통신하는 함수들
const API_BASE = process.env.REACT_APP_API_URL || '';

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
    if (!res.ok) throw new Error('수정 실패');
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