import React, { useState } from 'react';
import { ChevronRight, Plus, Save, X, Star, Home, MapPin, Car, Train } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';

const AddProperty = () => {
  const { setCurrentView, addProperty } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    date: new Date().toISOString().split('T')[0],
    rating: 3,
    status: '검토중',
    images: 0,
    
    // 면적 관련
    areaPyeong: '',
    areaM2: '',
    
    // 공간 구성
    roomCount: 1,
    bathroomCount: 1,
    
    // 층수/방향
    floorNumber: '',
    totalFloors: '',
    direction: '',
    
    // 건물 정보
    buildingType: '',
    buildYear: '',
    
    // 비용 관련
    maintenanceFee: '',
    heatingType: '',
    
    // 편의시설
    parkingAvailable: false,
    elevatorAvailable: false,
    
    // 교통 관련
    nearestStation: '',
    walkingMinutes: '',
    
    // 장점/단점
    advantages: [''],
    disadvantages: [''],
    
    // 추가 상세 정보
    details: {
      options: [],
      memo: '',
      petAllowed: false,
      shortTermRent: false
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.address || !formData.price) {
      alert('제목, 주소, 가격은 필수 입력 항목입니다.');
      return;
    }

    setLoading(true);
    try {
      // API 스펙에 맞는 데이터 구조로 변환
      const dataToSave = {
        title: formData.title.trim(),
        address: formData.address.trim(),
        price: formData.price.trim(),
        date: formData.date || null,
        rating: formData.rating,
        status: formData.status,
        images: formData.images,
        
        // 면적 관련
        areaPyeong: formData.areaPyeong ? parseFloat(formData.areaPyeong) : null,
        areaM2: formData.areaM2 ? parseFloat(formData.areaM2) : null,
        
        // 공간 구성
        roomCount: parseInt(formData.roomCount) || 1,
        bathroomCount: parseInt(formData.bathroomCount) || 1,
        
        // 층수/방향
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        direction: formData.direction?.trim() || null,
        
        // 건물 정보
        buildingType: formData.buildingType?.trim() || null,
        buildYear: formData.buildYear ? parseInt(formData.buildYear) : null,
        
        // 비용 관련
        maintenanceFee: formData.maintenanceFee?.trim() || null,
        heatingType: formData.heatingType?.trim() || null,
        
        // 편의시설
        parkingAvailable: formData.parkingAvailable,
        elevatorAvailable: formData.elevatorAvailable,
        
        // 교통 관련
        nearestStation: formData.nearestStation?.trim() || null,
        walkingMinutes: formData.walkingMinutes ? parseInt(formData.walkingMinutes) : null,
        
        // 장점/단점
        advantages: formData.advantages.filter(item => item.trim() !== ''),
        disadvantages: formData.disadvantages.filter(item => item.trim() !== ''),
        
        // 추가 상세 정보
        details: {
          options: formData.details.options,
          memo: formData.details.memo?.trim() || null,
          petAllowed: formData.details.petAllowed,
          shortTermRent: formData.details.shortTermRent
        }
      };

      await addProperty(dataToSave);
      setCurrentView('list');
    } catch (error) {
      alert('매물 기록 저장에 실패했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => setCurrentView('list')}
          className="btn-secondary mb-6 flex items-center space-x-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>목록으로 돌아가기</span>
        </button>
        
        <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-8">새 매물 기록 등록</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 기본 정보 */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">기본 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">물건명 *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="input-glass"
                        placeholder="예: 강남구 역삼동 오피스텔"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">주소 *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="input-glass"
                        placeholder="예: 서울시 강남구 역삼동 123-45"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">가격 *</label>
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="input-glass"
                        placeholder="예: 5억 2천"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">매물일</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="input-glass"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">상태</label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="input-glass"
                      >
                        <option value="관심" className="bg-gray-800">관심</option>
                        <option value="검토중" className="bg-gray-800">검토중</option>
                        <option value="보류" className="bg-gray-800">보류</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">평가</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => handleInputChange('rating', rating)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 ${rating <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'} hover:text-yellow-300 transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="text-white ml-2">{formData.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 상세 정보 */}
              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Home className="w-5 h-5 mr-2" />
                    상세 정보
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">면적 (평)</label>
                        <input
                          type="text"
                          value={formData.areaPyeong}
                          onChange={(e) => handleInputChange('areaPyeong', e.target.value)}
                          className="input-glass"
                          placeholder="예: 25.5"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">면적 (m²)</label>
                        <input
                          type="text"
                          value={formData.areaM2}
                          onChange={(e) => handleInputChange('areaM2', e.target.value)}
                          className="input-glass"
                          placeholder="예: 84.3"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">방 개수</label>
                        <input
                          type="number"
                          value={formData.roomCount}
                          onChange={(e) => handleInputChange('roomCount', e.target.value)}
                          className="input-glass"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">화장실 개수</label>
                        <input
                          type="number"
                          value={formData.bathroomCount}
                          onChange={(e) => handleInputChange('bathroomCount', e.target.value)}
                          className="input-glass"
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">해당 층수</label>
                        <input
                          type="text"
                          value={formData.floorNumber}
                          onChange={(e) => handleInputChange('floorNumber', e.target.value)}
                          className="input-glass"
                          placeholder="예: 15"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">전체 층수</label>
                        <input
                          type="text"
                          value={formData.totalFloors}
                          onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                          className="input-glass"
                          placeholder="예: 25"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">방향</label>
                      <input
                        type="text"
                        value={formData.direction}
                        onChange={(e) => handleInputChange('direction', e.target.value)}
                        className="input-glass"
                        placeholder="예: 남동향"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">건물 유형</label>
                        <input
                          type="text"
                          value={formData.buildingType}
                          onChange={(e) => handleInputChange('buildingType', e.target.value)}
                          className="input-glass"
                          placeholder="예: 오피스텔"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">건축 연도</label>
                        <input
                          type="text"
                          value={formData.buildYear}
                          onChange={(e) => handleInputChange('buildYear', e.target.value)}
                          className="input-glass"
                          placeholder="예: 2018"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 비용 및 편의시설 */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    비용 및 편의시설
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">관리비</label>
                        <input
                          type="text"
                          value={formData.maintenanceFee}
                          onChange={(e) => handleInputChange('maintenanceFee', e.target.value)}
                          className="input-glass"
                          placeholder="예: 12만원"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">난방 방식</label>
                        <input
                          type="text"
                          value={formData.heatingType}
                          onChange={(e) => handleInputChange('heatingType', e.target.value)}
                          className="input-glass"
                          placeholder="예: 개별난방"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="parkingAvailable"
                          checked={formData.parkingAvailable}
                          onChange={(e) => handleInputChange('parkingAvailable', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="parkingAvailable" className="text-white/80 text-sm">주차 가능</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="elevatorAvailable"
                          checked={formData.elevatorAvailable}
                          onChange={(e) => handleInputChange('elevatorAvailable', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="elevatorAvailable" className="text-white/80 text-sm">엘리베이터 있음</label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 교통 정보 */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Train className="w-5 h-5 mr-2" />
                    교통 정보
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">가장 가까운 역</label>
                        <input
                          type="text"
                          value={formData.nearestStation}
                          onChange={(e) => handleInputChange('nearestStation', e.target.value)}
                          className="input-glass"
                          placeholder="예: 강남역"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">도보 거리 (분)</label>
                        <input
                          type="number"
                          value={formData.walkingMinutes}
                          onChange={(e) => handleInputChange('walkingMinutes', e.target.value)}
                          className="input-glass"
                          placeholder="예: 5"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 장점 */}
            <div className="mt-8 bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">장점</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('advantages')}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  추가
                </button>
              </div>
              <div className="space-y-3">
                {formData.advantages.map((pro, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => handleArrayChange('advantages', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="장점을 입력하세요"
                    />
                    {formData.advantages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('advantages', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 단점 */}
            <div className="mt-6 bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">단점</h3>
                <button
                  type="button"
                  onClick={() => addArrayItem('disadvantages')}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  추가
                </button>
              </div>
              <div className="space-y-3">
                {formData.disadvantages.map((con, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-red-400">✗</span>
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => handleArrayChange('disadvantages', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="단점을 입력하세요"
                    />
                    {formData.disadvantages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('disadvantages', index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 메모 */}
            <div className="mt-6 bg-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
              <textarea
                value={formData.details.memo}
                onChange={(e) => handleDetailsChange('memo', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="매물 시 느낀 점이나 추가 정보를 자유롭게 작성하세요"
              />
            </div>
            
            {/* 추가 옵션 */}
            <div className="mt-6 bg-white/5 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">추가 옵션</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="petAllowed"
                      checked={formData.details.petAllowed}
                      onChange={(e) => handleDetailsChange('petAllowed', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="petAllowed" className="text-white/80 text-sm">반려동물 허용</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="shortTermRent"
                      checked={formData.details.shortTermRent}
                      onChange={(e) => handleDetailsChange('shortTermRent', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="shortTermRent" className="text-white/80 text-sm">단기 임대</label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 저장 버튼 */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-gray-500/30"
              >
                <X className="w-4 h-4" />
                <span>취소</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:transform-none flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? '저장 중...' : '저장'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;