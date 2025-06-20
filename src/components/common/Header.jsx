import React from 'react';
import { LogOut, Building, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Header = () => {
  const { user, logout } = useApp();
  
  return (
    <header className="glass-effect border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">임장 메모</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white/80">
            <User className="w-4 h-4" />
            <span>{user?.name}</span>
          </div>
          <button
            onClick={logout}
            className="btn-secondary flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;