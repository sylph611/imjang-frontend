import React, { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Calendar, Star, Edit, Trash2, Home, Car, Train, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';
import { api } from '../../services/mockAPI';

const PropertyDetail = () => {
  const { selectedProperty, propertyDetails, setCurrentView, fetchPropertyDetail, fetchPropertyList, setSelectedProperty, setPropertyDetails, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDetail = async () => {
      if (selectedProperty) {
        setLoading(true);
        try {
          await fetchPropertyDetail(selectedProperty);
        } catch (error) {
          console.error('Failed to fetch property detail:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDetail();
  }, [selectedProperty, fetchPropertyDetail]);

  useEffect(() => {
    if (propertyDetails) {
      setForm({
        title: propertyDetails.title || '',
        address: propertyDetails.address || '',
        price: propertyDetails.price || '',
        date: propertyDetails.date || '',
        rating: propertyDetails.rating || 3,
        status: propertyDetails.status || '검토중',
        images: propertyDetails.images || 0,
        
        // 면적 관련
        areaPyeong: propertyDetails.areaPyeong || '',
        areaM2: propertyDetails.areaM2 || '',
        
        // 공간 구성
        roomCount: propertyDetails.roomCount || 1,
        bathroomCount: propertyDetails.bathroomCount || 1,
        
        // 층수/방향
        floorNumber: propertyDetails.floorNumber || '',
        totalFloors: propertyDetails.totalFloors || '',
        direction: propertyDetails.direction || '',
        
        // 건물 정보
        buildingType: propertyDetails.buildingType || '',
        buildYear: propertyDetails.buildYear || '',
        
        // 비용 관련
        maintenanceFee: propertyDetails.maintenanceFee || '',
        heatingType: propertyDetails.heatingType || '',
        
        // 편의시설
        parkingAvailable: propertyDetails.parkingAvailable || false,
        elevatorAvailable: propertyDetails.elevatorAvailable || false,
        
        // 교통 관련
        nearestStation: propertyDetails.nearestStation || '',
        walkingMinutes: propertyDetails.walkingMinutes || '',
        
        // 장점/단점
        advantages: (propertyDetails.advantages && propertyDetails.advantages.length > 0) ? [...propertyDetails.advantages] : [''],
        disadvantages: (propertyDetails.disadvantages && propertyDetails.disadvantages.length > 0) ? [...propertyDetails.disadvantages] : [''],
        
        // 추가 상세 정보
        details: propertyDetails.details || {
          options: [],
          memo: '',
          petAllowed: false,
          shortTermRent: false
        }
      });
    }
  }, [propertyDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-center">로딩 중...</p>
        </div>
      </div>
    );
  }

  const detail = propertyDetails;
  if (!detail) {
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
          <div className="glass-effect rounded-2xl p-8 text-center">
            <p className="text-white">데이터를 찾을 수 없습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case '관심': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case '검토중': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case '보류': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // 수정 핸들러
  const handleEdit = () => {
    setIsEditing(true);
    setError("");
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      console.log('Deleting property:', detail.id); // 디버깅용
      await api.deleteProperty(detail.id, token);
      console.log('Property deleted successfully'); // 디버깅용
      
      // 즉시 목록으로 이동
      setCurrentView('list');
      
      // 목록 갱신 및 상태 초기화
      setTimeout(async () => {
        try {
          await fetchPropertyList();
          setSelectedProperty(null);
          setPropertyDetails(null);
          console.log('Property list refreshed after deletion'); // 디버깅용
        } catch (error) {
          console.error('Failed to refresh property list:', error);
        }
      }, 100);
      
    } catch (e) {
      console.error('Delete error:', e); // 디버깅용
      setError("삭제 실패: " + e.message);
    }
  };

  // 수정 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // details 객체 변경 핸들러
  const handleDetailsChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [field]: value
      }
    }));
  };

  // pros/cons 배열 입력 핸들러
  const handleArrayChange = (field, idx, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === idx ? value : item))
    }));
  };
  const addArrayItem = (field) => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };
  const removeArrayItem = (field, idx) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  // 수정 저장
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.address || !form.price) {
      setError('제목, 주소, 가격은 필수 입력 항목입니다.');
      return;
    }
    
    // 데이터 타입 변환 및 유효성 검사
    const dataToSave = {
      title: form.title.trim(),
      address: form.address.trim(),
      price: form.price.trim(), // 문자열로 유지
      date: form.date || null,
      rating: form.rating.toString(), // 문자열로 변환
      status: form.status,
      images: form.images,
      
      // 면적 관련
      areaPyeong: form.areaPyeong ? parseFloat(form.areaPyeong) : null,
      areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
      
      // 공간 구성
      roomCount: parseInt(form.roomCount) || 1,
      bathroomCount: parseInt(form.bathroomCount) || 1,
      
      // 층수/방향
      floorNumber: form.floorNumber ? parseInt(form.floorNumber) : null,
      totalFloors: form.totalFloors ? parseInt(form.totalFloors) : null,
      direction: form.direction?.trim() || null,
      
      // 건물 정보
      buildingType: form.buildingType?.trim() || null,
      buildYear: form.buildYear ? parseInt(form.buildYear) : null,
      
      // 비용 관련
      maintenanceFee: form.maintenanceFee?.trim() || null,
      heatingType: form.heatingType?.trim() || null,
      
      // 편의시설
      parkingAvailable: form.parkingAvailable,
      elevatorAvailable: form.elevatorAvailable,
      
      // 교통 관련
      nearestStation: form.nearestStation?.trim() || null,
      walkingMinutes: form.walkingMinutes ? parseInt(form.walkingMinutes) : null,
      
      // 장점/단점
      advantages: form.advantages.filter(item => item.trim() !== ''),
      disadvantages: form.disadvantages.filter(item => item.trim() !== ''),
      
      // 추가 상세 정보
      details: {
        options: form.details.options || [],
        memo: form.details.memo?.trim() || null,
        petAllowed: form.details.petAllowed || false,
        shortTermRent: form.details.shortTermRent || false
      }
    };

    // 필수 필드 재검증
    if (!dataToSave.price) {
      setError('가격을 입력해주세요.');
      return;
    }

    try {
      console.log('Sending data:', dataToSave); // 디버깅용
      await api.updateProperty(detail.id, dataToSave, token);
      await fetchPropertyDetail(detail.id);
      await fetchPropertyList(); // 목록도 갱신
      setIsEditing(false);
    } catch (e) {
      console.error('Update error:', e); // 디버깅용
      setError("수정 실패: " + e.message);
    }
  };

  // 목록으로 돌아가기 핸들러
  const handleBackToList = async () => {
    try {
      console.log('Refreshing property list...'); // 디버깅용
      await fetchPropertyList(); // 매물 목록 재조회
      console.log('Property list refreshed'); // 디버깅용
    } catch (error) {
      console.error('Failed to fetch property list:', error);
    } finally {
      setCurrentView('list'); // 항상 목록으로 이동
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBackToList}
          className="btn-secondary mb-6 flex items-center space-x-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>목록으로 돌아가기</span>
        </button>
        <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-fade-in">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-100 text-sm mb-4">
              {error}
            </div>
          )}
          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="input-glass text-3xl font-bold text-white mb-2 bg-transparent border-b border-white/30 focus:outline-none focus:border-blue-400 w-full"
                  />
                  <div className="flex items-center text-white/70 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="input-glass bg-transparent border-b border-white/30 focus:outline-none focus:border-blue-400 w-full text-white"
                    />
                  </div>
                </div>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(form.status)} bg-transparent`}
                >
                  <option value="관심">관심</option>
                  <option value="검토중">검토중</option>
                  <option value="보류">보류</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">기본 정보</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm mb-2">가격</label>
                        <input
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 5억 2천"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">매물일</label>
                        <input
                          name="date"
                          type="date"
                          value={form.date}
                          onChange={handleChange}
                          className="input-glass"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">상태</label>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className="input-glass"
                        >
                          <option value="관심">관심</option>
                          <option value="검토중">검토중</option>
                          <option value="보류">보류</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">평가</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, rating }))}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${rating <= form.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'} hover:text-yellow-300 transition-colors`}
                              />
                            </button>
                          ))}
                          <span className="text-white ml-2">{form.rating}/5</span>
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
                            name="areaPyeong"
                            value={form.areaPyeong}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 25.5"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">면적 (m²)</label>
                          <input
                            name="areaM2"
                            value={form.areaM2}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 84.3"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">방 개수</label>
                          <input
                            name="roomCount"
                            type="number"
                            value={form.roomCount}
                            onChange={handleChange}
                            className="input-glass"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">화장실 개수</label>
                          <input
                            name="bathroomCount"
                            type="number"
                            value={form.bathroomCount}
                            onChange={handleChange}
                            className="input-glass"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">해당 층수</label>
                          <input
                            name="floorNumber"
                            value={form.floorNumber}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 15"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">전체 층수</label>
                          <input
                            name="totalFloors"
                            value={form.totalFloors}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 25"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 text-sm mb-2">방향</label>
                        <input
                          name="direction"
                          value={form.direction}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 남동향"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 text-sm mb-2">건물 유형</label>
                          <input
                            name="buildingType"
                            value={form.buildingType}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 오피스텔"
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm mb-2">건축 연도</label>
                          <input
                            name="buildYear"
                            value={form.buildYear}
                            onChange={handleChange}
                            className="input-glass"
                            placeholder="예: 2018"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비용 및 편의시설 */}
              <div className="mb-8">
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
                          name="maintenanceFee"
                          value={form.maintenanceFee}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 12만원"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">난방 방식</label>
                        <input
                          name="heatingType"
                          value={form.heatingType}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 개별난방"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="parkingAvailable"
                          checked={form.parkingAvailable}
                          onChange={(e) => handleChange({ target: { name: 'parkingAvailable', value: e.target.checked } })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-white/80 text-sm">주차 가능</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="elevatorAvailable"
                          checked={form.elevatorAvailable}
                          onChange={(e) => handleChange({ target: { name: 'elevatorAvailable', value: e.target.checked } })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-white/80 text-sm">엘리베이터 있음</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 교통 정보 */}
              <div className="mb-8">
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
                          name="nearestStation"
                          value={form.nearestStation}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 강남역"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm mb-2">도보 거리 (분)</label>
                        <input
                          name="walkingMinutes"
                          type="number"
                          value={form.walkingMinutes}
                          onChange={handleChange}
                          className="input-glass"
                          placeholder="예: 5"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 장점 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
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
                    {form.advantages && form.advantages.length > 0 && (
                      <ul className="space-y-2">
                        {form.advantages.map((pro, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="text-green-400">✓</span>
                            <input
                              type="text"
                              value={pro}
                              onChange={e => handleArrayChange('advantages', idx, e.target.value)}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="장점을 입력하세요"
                            />
                            {form.advantages.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('advantages', idx)} className="text-red-400 hover:text-red-300 p-1">×</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* 단점 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
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
                    {form.disadvantages && form.disadvantages.length > 0 && (
                      <ul className="space-y-2">
                        {form.disadvantages.map((con, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="text-red-400">✗</span>
                            <input
                              type="text"
                              value={con}
                              onChange={e => handleArrayChange('disadvantages', idx, e.target.value)}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="단점을 입력하세요"
                            />
                            {form.disadvantages.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('disadvantages', idx)} className="text-red-400 hover:text-red-300 p-1">×</button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* 메모 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
                  <textarea
                    name="memo"
                    value={form.details.memo}
                    onChange={(e) => handleDetailsChange('memo', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    placeholder="매물 시 느낀 점이나 추가 정보를 자유롭게 작성하세요"
                  />
                </div>
              </div>

              {/* 추가 옵션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">추가 옵션</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="petAllowed"
                          checked={form.details.petAllowed}
                          onChange={(e) => handleDetailsChange('petAllowed', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-white/80 text-sm">반려동물 허용</label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="shortTermRent"
                          checked={form.details.shortTermRent}
                          onChange={(e) => handleDetailsChange('shortTermRent', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label className="text-white/80 text-sm">단기 임대</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-gray-500/30"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  저장
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{detail.title}</h1>
                  <div className="flex items-center text-white/70 mb-4">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{detail.address}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(detail.status)}`}>
                  {detail.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">기본 정보</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">가격</span>
                        <span className="font-semibold text-white">{detail.price || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">매물일</span>
                        <span className="text-white">{detail.date || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">평가</span>
                        <div className="flex items-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 ${i < detail.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                            />
                          ))}
                          <span className="text-white font-semibold">{detail.rating}/5</span>
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
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">면적 (평)</span>
                          <span className="text-white">{detail.areaPyeong || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">면적 (m²)</span>
                          <span className="text-white">{detail.areaM2 || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">방 개수</span>
                          <span className="text-white">{detail.roomCount || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">화장실 개수</span>
                          <span className="text-white">{detail.bathroomCount || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">해당 층수</span>
                          <span className="text-white">{detail.floorNumber || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">전체 층수</span>
                          <span className="text-white">{detail.totalFloors || '-'}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">방향</span>
                        <span className="text-white">{detail.direction || '-'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">건물 유형</span>
                          <span className="text-white">{detail.buildingType || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/80">건축 연도</span>
                          <span className="text-white">{detail.buildYear || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비용 및 편의시설 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    비용 및 편의시설
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">관리비</span>
                        <span className="text-white">{detail.maintenanceFee || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">난방 방식</span>
                        <span className="text-white">{detail.heatingType || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">주차 가능</span>
                        <span className="text-white">{detail.parkingAvailable ? '예' : '아니오'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">엘리베이터</span>
                        <span className="text-white">{detail.elevatorAvailable ? '있음' : '없음'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 교통 정보 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Train className="w-5 h-5 mr-2" />
                    교통 정보
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">가장 가까운 역</span>
                        <span className="text-white">{detail.nearestStation || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">도보 거리</span>
                        <span className="text-white">{detail.walkingMinutes ? `${detail.walkingMinutes}분` : '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 장점 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">장점</h3>
                  {detail.advantages && detail.advantages.length > 0 ? (
                    <ul className="space-y-2">
                      {detail.advantages.map((pro, index) => (
                        <li key={index} className="text-green-300 flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/50">등록된 장점이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 단점 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">단점</h3>
                  {detail.disadvantages && detail.disadvantages.length > 0 ? (
                    <ul className="space-y-2">
                      {detail.disadvantages.map((con, index) => (
                        <li key={index} className="text-red-300 flex items-start">
                          <span className="text-red-400 mr-2">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-white/50">등록된 단점이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 메모 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
                  <p className="text-white/80 leading-relaxed">
                    {detail.details?.memo || '등록된 메모가 없습니다.'}
                  </p>
                </div>
              </div>

              {/* 추가 옵션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">추가 옵션</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">반려동물 허용</span>
                        <span className="text-white">{detail.details?.petAllowed ? '예' : '아니오'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">단기 임대</span>
                        <span className="text-white">{detail.details?.shortTermRent ? '예' : '아니오'}</span>
                      </div>
                    </div>
                    {detail.details?.options && detail.details.options.length > 0 && (
                      <div>
                        <span className="text-white/80 block mb-2">기타 옵션</span>
                        <ul className="space-y-1">
                          {detail.details.options.map((option, index) => (
                            <li key={index} className="text-white">• {option}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-blue-500/30"
                  onClick={handleEdit}
                >
                  <Edit className="w-4 h-4" />
                  <span>수정</span>
                </button>
                <button
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-red-500/30"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>삭제</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;