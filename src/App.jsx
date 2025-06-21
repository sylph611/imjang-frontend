import React from 'react';
import { useApp } from './context/AppContext';
import Login from './components/auth/Login';
import PropertyList from './components/property/PropertyList';
import PropertyDetail from './components/property/PropertyDetail';
import AddProperty from './components/property/AddProperty';

const App = () => {
  const { token, currentView } = useApp();

  if (!token) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <PropertyList />;
      case 'detail':
        return <PropertyDetail />;
      case 'add':
        return <AddProperty />;
      default:
        return <PropertyList />;
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;