import React from 'react';
import { useApp } from './context/AppContext';
import Login from './components/auth/Login';
import ImjangList from './components/imjang/ImjangList';
import ImjangDetail from './components/imjang/ImjangDetail';
import AddImjang from './components/imjang/AddImjang';

const App = () => {
  const { token, currentView } = useApp();

  if (!token) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return <ImjangList />;
      case 'detail':
        return <ImjangDetail />;
      case 'add':
        return <AddImjang />;
      default:
        return <ImjangList />;
    }
  };

  return <div className="App">{renderView()}</div>;
};

export default App;