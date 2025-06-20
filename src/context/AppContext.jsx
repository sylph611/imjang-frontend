import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { mockAPI } from '../services/mockAPI';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('list');
  const [imjangList, setImjangList] = useState([]);
  const [selectedImjang, setSelectedImjang] = useState(null);
  const [imjangDetails, setImjangDetails] = useState(null);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetchImjangList(storedToken);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await mockAPI.login(email, password);
    setToken(response.token);
    setUser(response.user);
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    await fetchImjangList(response.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setImjangList([]);
    setSelectedImjang(null);
    setImjangDetails(null);
    setCurrentView('list');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  const fetchImjangList = useCallback(async (authToken = token) => {
    try {
      const list = await mockAPI.getImjangList(authToken);
      setImjangList(list);
    } catch (error) {
      console.error('Failed to fetch imjang list:', error);
    }
  }, [token]);

  const fetchImjangDetail = useCallback(async (id) => {
    try {
      const detail = await mockAPI.getImjangDetail(id, token);
      setImjangDetails(detail);
    } catch (error) {
      console.error('Failed to fetch imjang detail:', error);
      throw error;
    }
  }, [token]);

  const addImjang = useCallback(async (imjangData) => {
    try {
      // 서버에 저장할 데이터 구조로 변환
      const dataToSave = {
        title: imjangData.title,
        address: imjangData.address,
        price: imjangData.price,
        date: imjangData.date,
        rating: imjangData.rating,
        status: imjangData.status,
        details: {
          area: imjangData.area,
          floor: imjangData.floor,
          direction: imjangData.direction,
          parking: imjangData.parking,
          maintenance: imjangData.maintenance,
          pros: imjangData.pros.filter(item => item.trim() !== ''), // 빈 항목 제거
          cons: imjangData.cons.filter(item => item.trim() !== ''), // 빈 항목 제거
          memo: imjangData.memo
        }
      };

      const newImjang = await mockAPI.createImjang(dataToSave, token);
      setImjangList(prev => [newImjang, ...prev]); // 새 항목을 목록 맨 앞에 추가
    } catch (error) {
      console.error('Failed to add imjang:', error);
      throw error;
    }
  }, [token]);

  // selectedImjang이 변경될 때 imjangDetails 초기화
  useEffect(() => {
    if (selectedImjang === null) {
      setImjangDetails(null);
    }
  }, [selectedImjang]);

  const contextValue = {
    user,
    token,
    currentView,
    setCurrentView,
    imjangList,
    selectedImjang,
    setSelectedImjang,
    imjangDetails,
    login,
    logout,
    fetchImjangList,
    fetchImjangDetail,
    addImjang
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};