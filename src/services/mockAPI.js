// 실제 백엔드 API와 통신하는 함수들
const getApiBase = () => {
  if (process.env.NODE_ENV === 'production') {
    // 프로덕션에서는 환경 변수 우선, 없으면 상대 경로 사용
    return process.env.REACT_APP_API_URL || '';
  }
  
  // 개발 환경에서는 현재 호스트의 포트를 사용하거나 127.0.0.1 사용
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // 로컬 개발 환경에서는 proxy 사용 (상대 경로)
    return 'http://localhost:8080';
  }
  
  // 다른 환경에서는 127.0.0.1 사용
  return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
};

const API_BASE = getApiBase();

// 이미지 URL을 올바르게 처리하는 함수
const getImageUrl = (filePath) => {
  if (!filePath) {
    return null;
  }
  
  // 이미 절대 URL인 경우
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // 상대 경로인 경우 API_BASE와 결합
  if (filePath.startsWith('/')) {
    return API_BASE ? `${API_BASE}${filePath}` : filePath;
  }
  
  // 파일명만 있는 경우 - 여러 가능한 경로 시도
  const possiblePaths = [
    API_BASE ? `${API_BASE}/uploads/${filePath}` : `/uploads/${filePath}`,
    API_BASE ? `${API_BASE}/api/uploads/${filePath}` : `/api/uploads/${filePath}`,
    API_BASE ? `${API_BASE}/static/${filePath}` : `/static/${filePath}`,
    API_BASE ? `${API_BASE}/images/${filePath}` : `/images/${filePath}`,
    filePath // 원본 경로도 시도
  ];
  
  return possiblePaths[0]; // 첫 번째 경로 반환
};

// Mock 데이터 (API 서버가 없을 때 사용)
const mockData = {
  login: { token: 'mock-token-123', user: { id: 1, email: 'test@example.com', name: '테스트 사용자' } },
  properties: [
    { 
      id: 1, 
      title: '강남 아파트', 
      address: '서울시 강남구 역삼동 123-45', 
      price: '10억', 
      date: '2024-01-15', 
      rating: 4.5, 
      status: '관심',
      latitude: 37.5665,
      longitude: 126.9780
    },
    { 
      id: 2, 
      title: '홍대 원룸', 
      address: '서울시 마포구 홍대로 123', 
      price: '5000만원', 
      date: '2024-01-10', 
      rating: 3.8, 
      status: '방문예정',
      latitude: 37.5575,
      longitude: 126.9250
    }
  ]
};

// API 호출 공통 함수
const apiCall = async (endpoint, options = {}) => {
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;
  
  // Mock 모드 체크 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK === 'true') {
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
    
    // DELETE와 같이 응답이 없는 경우 처리
    if (res.status === 204 || options.method === 'DELETE') {
      return;
    }
    
    return await res.json();
  } catch (error) {
    console.error('API Call Error:', error);
    
    // 개발 환경에서 API 서버가 없을 때 mock 데이터 사용
    if (process.env.NODE_ENV === 'development' && error.message.includes('Failed to fetch')) {
      if (endpoint === '/api/login') {
        return mockData.login;
      } else if (endpoint === '/api/properties') {
        return mockData.properties;
      }
    }
    
    throw error;
  }
};

// 파일 업로드용 API 호출 함수
const uploadApiCall = async (endpoint, formData, token) => {
  const url = API_BASE ? `${API_BASE}${endpoint}` : endpoint;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Upload API Error:', res.status, errorText);
      throw new Error(`업로드 실패 (${res.status}): ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Upload API Call Error:', error);
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
    const properties = await apiCall('/api/properties', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // 각 매물의 이미지 정보를 가져오기
    if (properties && Array.isArray(properties)) {
      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          try {
            const images = await api.getPropertyImages(property.id, token);
            
            const processedImages = images ? images.map(img => ({
              ...img,
              filePath: getImageUrl(img.filePath)
            })) : [];
            
            return {
              ...property,
              propertyImages: processedImages,
              mainImageUrl: processedImages.length > 0 
                ? (processedImages.find(img => img.isMainImage) || processedImages[0]).filePath 
                : null
            };
          } catch (error) {
            console.error(`Failed to fetch images for property ${property.id}:`, error);
            return {
              ...property,
              propertyImages: [],
              mainImageUrl: null
            };
          }
        })
      );
      return propertiesWithImages;
    }
    
    return properties;
  },

  getPropertiesInBounds: async (minLat, maxLat, minLng, maxLng, token) => {
    const properties = await apiCall(`/api/properties/in-bounds?minLat=${minLat}&maxLat=${maxLat}&minLng=${minLng}&maxLng=${maxLng}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // 각 매물의 이미지 정보를 가져오기
    if (properties && Array.isArray(properties)) {
      const propertiesWithImages = await Promise.all(
        properties.map(async (property) => {
          try {
            const images = await api.getPropertyImages(property.id, token);
            
            const processedImages = images ? images.map(img => ({
              ...img,
              filePath: getImageUrl(img.filePath)
            })) : [];
            
            return {
              ...property,
              propertyImages: processedImages,
              mainImageUrl: processedImages.length > 0 
                ? (processedImages.find(img => img.isMainImage) || processedImages[0]).filePath 
                : null
            };
          } catch (error) {
            console.error(`Failed to fetch images for property ${property.id}:`, error);
            return {
              ...property,
              propertyImages: [],
              mainImageUrl: null
            };
          }
        })
      );
      return propertiesWithImages;
    }
    
    return properties;
  },

  getPropertyDetail: async (id, token) => {
    const property = await apiCall(`/api/properties/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // 이미지 정보도 함께 가져오기
    try {
      const images = await api.getPropertyImages(id, token);
      const processedImages = images ? images.map(img => ({
        ...img,
        filePath: getImageUrl(img.filePath)
      })) : [];
      
      return {
        ...property,
        propertyImages: processedImages,
        mainImageUrl: processedImages.length > 0 
          ? (processedImages.find(img => img.isMainImage) || processedImages[0]).filePath 
          : null
      };
    } catch (error) {
      console.error(`Failed to fetch images for property ${id}:`, error);
      return {
        ...property,
        propertyImages: [],
        mainImageUrl: null
      };
    }
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
  },

  // 이미지 관련 API
  uploadPropertyImage: async (propertyId, file, displayOrder = null, isMainImage = false, token) => {
    const formData = new FormData();
    formData.append('file', file);
    if (displayOrder !== null) {
      formData.append('displayOrder', displayOrder);
    }
    formData.append('isMainImage', isMainImage);
    
    const result = await uploadApiCall(`/api/properties/${propertyId}/images`, formData, token);
    return {
      ...result,
      filePath: getImageUrl(result.filePath)
    };
  },

  uploadMultiplePropertyImages: async (propertyId, files, token) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const results = await uploadApiCall(`/api/properties/${propertyId}/images/multiple`, formData, token);
    return Array.isArray(results) ? results.map(result => ({
      ...result,
      filePath: getImageUrl(result.filePath)
    })) : results;
  },

  getPropertyImages: async (propertyId, token) => {
    const images = await apiCall(`/api/properties/${propertyId}/images`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return Array.isArray(images) ? images.map(img => ({
      ...img,
      filePath: getImageUrl(img.filePath)
    })) : images;
  },

  deletePropertyImage: async (propertyId, imageId, token) => {
    return apiCall(`/api/properties/${propertyId}/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  deleteAllPropertyImages: async (propertyId, token) => {
    return apiCall(`/api/properties/${propertyId}/images`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  setMainImage: async (propertyId, imageId, token) => {
    return apiCall(`/api/properties/${propertyId}/images/${imageId}/main`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },

  updateImageOrder: async (propertyId, imageId, order, token) => {
    return apiCall(`/api/properties/${propertyId}/images/${imageId}/order?order=${order}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
};