import React, { useState } from 'react';
import { Plus, List, Map } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';
import PropertyCard from './PropertyCard';
import PropertyMapView from './PropertyMapView';

const PropertyList = () => {
  const { propertyList, setCurrentView, setSelectedProperty } = useApp();
  const [activeTab, setActiveTab] = useState('list'); // 'list' 또는 'map'

  const handleCardClick = (id) => {
    setSelectedProperty(id);
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
            <h2 className="text-3xl font-bold text-white mb-2">매물 기록</h2>
            <p className="text-white/70">총 {propertyList.length}개의 기록이 있습니다</p>
          </div>
          
          <button 
            onClick={handleAddClick}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>새 매물 기록</span>
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'list'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <List className="w-5 h-5" />
            <span>목록 보기</span>
          </button>
          
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Map className="w-5 h-5" />
            <span>지도 보기</span>
          </button>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'list' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {propertyList.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={handleCardClick}
                />
              ))}
            </div>
            
            {propertyList.length === 0 && (
              <div className="text-center py-20">
                <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
                  <h3 className="text-xl font-semibold text-white mb-2">아직 등록된 매물 기록이 없습니다</h3>
                  <p className="text-white/70 mb-6">첫 번째 매물 기록을 등록해보세요</p>
                  <button 
                    onClick={handleAddClick}
                    className="btn-primary flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>새 매물 기록</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <PropertyMapView />
        )}
      </div>
    </div>
  );
};

export default PropertyList;