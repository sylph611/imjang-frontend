import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/mockAPI';

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
  const [propertyList, setPropertyList] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyDetails, setPropertyDetails] = useState(null);

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      fetchPropertyList(storedToken);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.login(email, password);
    setToken(response.token);
    setUser(response.user);
    sessionStorage.setItem('token', response.token);
    sessionStorage.setItem('user', JSON.stringify(response.user));
    await fetchPropertyList(response.token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setPropertyList([]);
    setSelectedProperty(null);
    setPropertyDetails(null);
    setCurrentView('list');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }, []);

  const fetchPropertyList = useCallback(async (authToken = token) => {
    try {
      const list = await api.getPropertyList(authToken);
      setPropertyList(list);
    } catch (error) {
      console.error('Failed to fetch property list:', error);
    }
  }, [token]);

  const fetchPropertyDetail = useCallback(async (id) => {
    try {
      const detail = await api.getPropertyDetail(id, token);
      setPropertyDetails(detail);
    } catch (error) {
      console.error('Failed to fetch property detail:', error);
      throw error;
    }
  }, [token]);

  const addProperty = useCallback(async (propertyData) => {
    try {
      // API 스펙에 맞는 데이터 구조로 변환
      const dataToSave = {
        title: propertyData.title,
        address: propertyData.address,
        price: propertyData.price,
        date: propertyData.date,
        rating: propertyData.rating,
        status: propertyData.status,
        images: propertyData.images,
        
        // 면적 관련
        areaPyeong: propertyData.areaPyeong,
        areaM2: propertyData.areaM2,
        
        // 공간 구성
        roomCount: propertyData.roomCount,
        bathroomCount: propertyData.bathroomCount,
        
        // 층수/방향
        floorNumber: propertyData.floorNumber,
        totalFloors: propertyData.totalFloors,
        direction: propertyData.direction,
        
        // 건물 정보
        buildingType: propertyData.buildingType,
        buildYear: propertyData.buildYear,
        
        // 비용 관련
        maintenanceFee: propertyData.maintenanceFee,
        heatingType: propertyData.heatingType,
        
        // 편의시설
        parkingAvailable: propertyData.parkingAvailable,
        elevatorAvailable: propertyData.elevatorAvailable,
        
        // 교통 관련
        nearestStation: propertyData.nearestStation,
        walkingMinutes: propertyData.walkingMinutes,
        
        // 장점/단점
        advantages: propertyData.advantages,
        disadvantages: propertyData.disadvantages,
        
        // 추가 상세 정보
        details: propertyData.details
      };
      
      const newProperty = await api.createProperty(dataToSave, token);
      setPropertyList(prev => [newProperty, ...prev]);
      return newProperty;
    } catch (error) {
      console.error('Failed to add property:', error);
      throw error;
    }
  }, [token]);

  const updateProperty = useCallback(async (id, propertyData) => {
    try {
      const updatedProperty = await api.updateProperty(id, propertyData, token);
      setPropertyList(prev => prev.map(p => p.id === id ? updatedProperty : p));
      setPropertyDetails(updatedProperty);
    } catch (error) {
      console.error('Failed to update property:', error);
      throw error;
    }
  }, [token]);

  const deleteProperty = useCallback(async (id) => {
    try {
      await api.deleteProperty(id, token);
      setPropertyList(prev => prev.filter(p => p.id !== id));
      setSelectedProperty(null);
      setCurrentView('list');
    } catch (error) {
      console.error('Failed to delete property:', error);
      throw error;
    }
  }, [token]);

  // selectedProperty이 변경될 때 propertyDetails 초기화
  useEffect(() => {
    if (selectedProperty === null) {
      setPropertyDetails(null);
    }
  }, [selectedProperty]);

  const contextValue = {
    user,
    token,
    currentView,
    setCurrentView,
    propertyList,
    selectedProperty,
    setSelectedProperty,
    propertyDetails,
    login,
    logout,
    fetchPropertyList,
    fetchPropertyDetail,
    addProperty,
    updateProperty,
    deleteProperty
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};