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
      const dataToSave = {
        title: propertyData.title,
        address: propertyData.address,
        price: propertyData.price,
        date: propertyData.date,
        rating: propertyData.rating,
        status: propertyData.status,
        advantages: propertyData.pros.filter(item => item.trim() !== ''),
        disadvantages: propertyData.cons.filter(item => item.trim() !== ''),
        details: {
          area: propertyData.area,
          floor: propertyData.floor,
          direction: propertyData.direction,
          parking: propertyData.parking,
          maintenance: propertyData.maintenance,
          memo: propertyData.memo
        }
      };
      const newProperty = await api.createProperty(dataToSave, token);
      setPropertyList(prev => [newProperty, ...prev]);
    } catch (error) {
      console.error('Failed to add property:', error);
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
    addProperty
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};