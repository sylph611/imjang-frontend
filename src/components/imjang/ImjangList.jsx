import React from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';
import ImjangCard from './ImjangCard';

const ImjangList = () => {
  const { imjangList, setCurrentView, setSelectedImjang } = useApp();

  const handleCardClick = (id) => {
    setSelectedImjang(id);
    setCurrentView('detail');
  };

  const handleAddClick = () => {
    setCurrentView('add');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">임장 기록</h2>
            <p className="text-white/70">총 {imjangList.length}개의 기록이 있습니다</p>
          </div>
          
          <button 
            onClick={handleAddClick}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>새 임장 기록</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {imjangList.map((imjang) => (
            <ImjangCard
              key={imjang.id}
              imjang={imjang}
              onClick={handleCardClick}
            />
          ))}
        </div>
        
        {imjangList.length === 0 && (
          <div className="text-center py-20">
            <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 임장 기록이 없습니다</h3>
              <p className="text-white/70 mb-6">첫 번째 임장 기록을 등록해보세요</p>
              <button 
                onClick={handleAddClick}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>새 임장 기록</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImjangList;