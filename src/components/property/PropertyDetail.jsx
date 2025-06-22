import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, MapPin, Star, Edit, Trash2, Home, Car, Train, Plus, Camera, Upload, X, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw, ChevronLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';
import { api } from '../../services/mockAPI';
import AddressSearch from '../maps/AddressSearch';
import GoogleMap from '../maps/GoogleMap';

const PropertyDetail = () => {
  const { selectedProperty, propertyDetails, setCurrentView, fetchPropertyDetail, fetchPropertyList, setSelectedProperty, setPropertyDetails, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [propertyImages, setPropertyImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  useEffect(() => {
    const loadDetail = async () => {
      if (selectedProperty) {
        setLoading(true);
        try {
          await fetchPropertyDetail(selectedProperty);
          // 이미지 목록은 getPropertyDetail에서 함께 가져오므로 별도 호출 불필요
        } catch (error) {
          // console.error('Failed to fetch property detail:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadDetail();
  }, [selectedProperty, fetchPropertyDetail, token]);

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
        
        latitude: propertyDetails.latitude || null,
        longitude: propertyDetails.longitude || null,
        
        areaPyeong: propertyDetails.areaPyeong || '',
        areaM2: propertyDetails.areaM2 || '',
        
        roomCount: propertyDetails.roomCount || 1,
        bathroomCount: propertyDetails.bathroomCount || 1,
        
        floorNumber: propertyDetails.floorNumber || '',
        totalFloors: propertyDetails.totalFloors || '',
        direction: propertyDetails.direction || '',
        
        buildingType: propertyDetails.buildingType || '',
        buildYear: propertyDetails.buildYear || '',
        
        maintenanceFee: propertyDetails.maintenanceFee || '',
        heatingType: propertyDetails.heatingType || '',
        
        parkingAvailable: propertyDetails.parkingAvailable || false,
        elevatorAvailable: propertyDetails.elevatorAvailable || false,
        
        nearestStation: propertyDetails.nearestStation || '',
        walkingMinutes: propertyDetails.walkingMinutes || '',
        
        advantages: (propertyDetails.advantages && propertyDetails.advantages.length > 0) ? [...propertyDetails.advantages] : [''],
        disadvantages: (propertyDetails.disadvantages && propertyDetails.disadvantages.length > 0) ? [...propertyDetails.disadvantages] : [''],
        
        details: propertyDetails.details || {
          options: [],
          memo: '',
          petAllowed: false,
          shortTermRent: false
        }
      });
      
      setPropertyImages(propertyDetails.propertyImages || []);
    }
  }, [propertyDetails]);

  // 모달 관련 함수들을 먼저 정의
  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImage(null);
    setImageScale(1);
    setImageRotation(0);
  }, []);

  const zoomIn = useCallback(() => {
    setImageScale(prev => Math.min(prev * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setImageScale(prev => Math.max(prev / 1.2, 0.5));
  }, []);

  const rotateImage = useCallback(() => {
    setImageRotation(prev => (prev + 90) % 360);
  }, []);

  const goToPreviousImage = useCallback(() => {
    if (!selectedImage || propertyImages.length <= 1) return;
    
    const currentIndex = propertyImages.findIndex(img => img.id === selectedImage.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : propertyImages.length - 1;
    const previousImage = propertyImages[previousIndex];
    
    setSelectedImage(previousImage);
    setImageScale(1);
    setImageRotation(0);
  }, [selectedImage, propertyImages]);

  const goToNextImage = useCallback(() => {
    if (!selectedImage || propertyImages.length <= 1) return;
    
    const currentIndex = propertyImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < propertyImages.length - 1 ? currentIndex + 1 : 0;
    const nextImage = propertyImages[nextIndex];
    
    setSelectedImage(nextImage);
    setImageScale(1);
    setImageRotation(0);
  }, [selectedImage, propertyImages]);

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
    setShowImageModal(true);
    setImageScale(1);
    setImageRotation(0);
  }, []);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showImageModal) return;
      
      switch (e.key) {
        case 'Escape':
          closeImageModal();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextImage();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rotateImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, selectedImage, propertyImages, closeImageModal, goToPreviousImage, goToNextImage, zoomIn, zoomOut, rotateImage]);

  // 위치 선택 핸들러
  const handleLocationSelect = useCallback((locationData) => {
    setForm(prev => ({
      ...prev,
      address: locationData.address,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    }));
  }, []);

  // form의 위도(latitude) 값이 변경될 때마다 로그를 출력하여 상태 변경을 추적합니다.
  useEffect(() => {
    if (form?.latitude) {
      console.log('[PropertyDetail] form 상태 업데이트됨, 위도:', form.latitude);
    }
  }, [form?.latitude]);

  // 수정 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 입력 전용 핸들러 (디바운싱 적용)
  const handleAddressChange = useCallback((value) => {
    setForm((prev) => ({ ...prev, address: value }));
  }, []);

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
    
    const dataToSave = {
      title: form.title.trim(),
      address: form.address.trim(),
      price: form.price.trim(),
      date: form.date || null,
      rating: form.rating.toString(),
      status: form.status,
      images: form.images,
      
      latitude: form.latitude,
      longitude: form.longitude,
      
      areaPyeong: form.areaPyeong ? parseFloat(form.areaPyeong) : null,
      areaM2: form.areaM2 ? parseFloat(form.areaM2) : null,
      
      roomCount: parseInt(form.roomCount) || 1,
      bathroomCount: parseInt(form.bathroomCount) || 1,
      
      floorNumber: form.floorNumber ? parseInt(form.floorNumber) : null,
      totalFloors: form.totalFloors ? parseInt(form.totalFloors) : null,
      direction: form.direction?.trim() || null,
      
      buildingType: form.buildingType?.trim() || null,
      buildYear: form.buildYear ? parseInt(form.buildYear) : null,
      
      maintenanceFee: form.maintenanceFee?.trim() || null,
      heatingType: form.heatingType?.trim() || null,
      
      parkingAvailable: form.parkingAvailable,
      elevatorAvailable: form.elevatorAvailable,
      
      nearestStation: form.nearestStation?.trim() || null,
      walkingMinutes: form.walkingMinutes ? parseInt(form.walkingMinutes) : null,
      
      advantages: form.advantages.filter(item => item.trim() !== ''),
      disadvantages: form.disadvantages.filter(item => item.trim() !== ''),
      
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

  // 이미지 업로드 관련 핸들러들
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleImageUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploadingImages(true);
    setError("");
    
    try {
      let uploadedImages = [];
      
      if (selectedFiles.length === 1) {
        // 단일 이미지 업로드
        const isMainImage = propertyImages.length === 0; // 첫 번째 이미지는 메인 이미지로 설정
        const result = await api.uploadPropertyImage(
          detail.id, 
          selectedFiles[0], 
          propertyImages.length + 1, 
          isMainImage, 
          token
        );
        uploadedImages = [result];
      } else {
        // 다중 이미지 업로드
        const results = await api.uploadMultiplePropertyImages(detail.id, selectedFiles, token);
        uploadedImages = Array.isArray(results) ? results : [results];
      }
      
      // 로컬 상태 즉시 업데이트
      setPropertyImages(prev => [...prev, ...uploadedImages]);
      
      // 매물 상세 정보 새로고침 (이미지 정보 포함)
      await fetchPropertyDetail(detail.id);
      
      // 매물 목록도 새로고침 (이미지 개수 업데이트)
      await fetchPropertyList();
      
      setSelectedFiles([]);
    } catch (e) {
      console.error('Image upload error:', e);
      setError("이미지 업로드 실패: " + e.message);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("이 이미지를 삭제하시겠습니까?")) return;
    
    try {
      await api.deletePropertyImage(detail.id, imageId, token);
      
      // 로컬 상태 즉시 업데이트
      setPropertyImages(prev => prev.filter(img => img.id !== imageId));
      
      // 매물 목록만 새로고침 (이미지 개수 업데이트)
      await fetchPropertyList();
    } catch (e) {
      console.error('Image delete error:', e);
      setError("이미지 삭제 실패: " + e.message);
    }
  };

  const handleSetMainImage = async (imageId) => {
    try {
      await api.setMainImage(detail.id, imageId, token);
      
      // 로컬 상태 즉시 업데이트
      setPropertyImages(prev => prev.map(img => ({
        ...img,
        isMainImage: img.id === imageId
      })));
      
      // 매물 상세 정보 새로고침
      await fetchPropertyDetail(detail.id);
      
      // 매물 목록도 새로고침 (메인 이미지 변경 반영)
      await fetchPropertyList();
    } catch (e) {
      console.error('Set main image error:', e);
      setError("메인 이미지 설정 실패: " + e.message);
    }
  };

  const getMainImageUrl = () => {
    // propertyDetails에서 mainImageUrl 확인
    if (propertyDetails?.mainImageUrl) {
      return propertyDetails.mainImageUrl;
    }
    
    // propertyImages에서 메인 이미지 찾기
    const mainImage = propertyImages.find(img => img.isMainImage);
    if (mainImage) {
      return mainImage.filePath;
    }
    
    // 첫 번째 이미지 반환
    if (propertyImages.length > 0) {
      return propertyImages[0].filePath;
    }
    
    return null;
  };

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
                    <span>{form.address || '주소를 입력하세요'}</span>
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

              {/* 메인 이미지 */}
              {getMainImageUrl() && (
                <div className="mb-8">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/10">
                    <img
                      src={getMainImageUrl()}
                      alt={form.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center" style={{ display: 'none' }}>
                      <ImageIcon className="w-24 h-24 text-white/30" />
                    </div>
                  </div>
                </div>
              )}
              
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
                          className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(form.status)} bg-transparent`}
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

              {/* 위치 정보 섹션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    위치 정보
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">주소</label>
                      <AddressSearch
                        value={form.address}
                        onChange={handleAddressChange}
                        onLocationSelect={handleLocationSelect}
                        placeholder="주소, 건물명, 지역명을 입력하세요"
                      />
                    </div>
                    {(form.latitude && form.longitude) && (
                      <div>
                        <label className="block text-white/80 text-sm mb-2">지도</label>
                        <GoogleMap
                          latitude={form.latitude}
                          longitude={form.longitude}
                          address={form.address}
                          height="300px"
                          showMarker={true}
                          draggable={true}
                          onLocationSelect={handleLocationSelect}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 이미지 섹션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      매물 이미지
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload-edit"
                      />
                      <label
                        htmlFor="image-upload-edit"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-sm transition-all cursor-pointer flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        이미지 선택
                      </label>
                      {selectedFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingImages}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm transition-all flex items-center disabled:opacity-50"
                        >
                          {uploadingImages ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300 mr-1"></div>
                              업로드 중...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              업로드 ({selectedFiles.length}개)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 선택된 파일 목록 */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-white/80 text-sm mb-2">선택된 파일:</p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-white/70 text-sm">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 이미지 목록 */}
                  {propertyImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {propertyImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div 
                            className="relative aspect-square rounded-lg overflow-hidden bg-white/10 cursor-pointer"
                            onClick={() => handleImageClick(image)}
                          >
                            <img
                              src={image.filePath}
                              alt={image.originalName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDMwIDEwMEMxMzAgMTE2LjU2OSAxMTYuNTY5IDEzMCAxMDAgMTMwQzgzLjQzMSAxMzAgNzAgMTE2LjU2OSA3MCAxMEM3MCA4My40MzEgODMuNDMxIDcwIDEwMCA3MFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+';
                              }}
                            />
                            {image.isMainImage && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                메인
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageClick(image);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                                title="상세 보기"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              {!image.isMainImage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetMainImage(image.id);
                                  }}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                                  title="메인 이미지로 설정"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image.id);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                title="이미지 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/70 text-xs mt-1 truncate">{image.originalName}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/50">등록된 이미지가 없습니다.</p>
                      <p className="text-white/30 text-sm mt-2">위의 '이미지 선택' 버튼을 클릭하여 이미지를 추가하세요.</p>
                    </div>
                  )}
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
                    <span>{detail.address || '주소를 입력하세요'}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(detail.status)}`}>
                  {detail.status}
                </span>
              </div>

              {/* 메인 이미지 */}
              {getMainImageUrl() && (
                <div className="mb-8">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/10">
                    <img
                      src={getMainImageUrl()}
                      alt={detail.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center" style={{ display: 'none' }}>
                      <ImageIcon className="w-24 h-24 text-white/30" />
                    </div>
                  </div>
                </div>
              )}
              
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

              {/* 위치 정보 섹션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    위치 정보
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/80">주소</span>
                      <span className="text-white">{detail.address || '-'}</span>
                    </div>
                    {(detail.latitude && detail.longitude) && (
                      <div>
                        <label className="block text-white/80 text-sm mb-2">지도</label>
                        <GoogleMap
                          latitude={detail.latitude}
                          longitude={detail.longitude}
                          address={detail.address}
                          height="300px"
                          showMarker={true}
                          draggable={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 이미지 섹션 */}
              <div className="mb-8">
                <div className="bg-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Camera className="w-5 h-5 mr-2" />
                      매물 이미지
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload-edit"
                      />
                      <label
                        htmlFor="image-upload-edit"
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-sm transition-all cursor-pointer flex items-center"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        이미지 선택
                      </label>
                      {selectedFiles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleImageUpload}
                          disabled={uploadingImages}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm transition-all flex items-center disabled:opacity-50"
                        >
                          {uploadingImages ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300 mr-1"></div>
                              업로드 중...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              업로드 ({selectedFiles.length}개)
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 선택된 파일 목록 */}
                  {selectedFiles.length > 0 && (
                    <div className="mb-4 p-3 bg-white/10 rounded-lg">
                      <p className="text-white/80 text-sm mb-2">선택된 파일:</p>
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-white/70 text-sm">
                            <span>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 이미지 목록 */}
                  {propertyImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {propertyImages.map((image) => (
                        <div key={image.id} className="relative group">
                          <div 
                            className="relative aspect-square rounded-lg overflow-hidden bg-white/10 cursor-pointer"
                            onClick={() => handleImageClick(image)}
                          >
                            <img
                              src={image.filePath}
                              alt={image.originalName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDMwIDEwMEMxMzAgMTE2LjU2OSAxMTYuNTY5IDEzMCAxMDAgMTMwQzgzLjQzMSAxMzAgNzAgMTE2LjU2OSA3MCAxMEM3MCA4My40MzEgODMuNDMxIDcwIDEwMCA3MFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+';
                              }}
                            />
                            {image.isMainImage && (
                              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                메인
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageClick(image);
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                                title="상세 보기"
                              >
                                <ImageIcon className="w-4 h-4" />
                              </button>
                              {!image.isMainImage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetMainImage(image.id);
                                  }}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                                  title="메인 이미지로 설정"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteImage(image.id);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                title="이미지 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-white/70 text-xs mt-1 truncate">{image.originalName}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ImageIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
                      <p className="text-white/50">등록된 이미지가 없습니다.</p>
                      <p className="text-white/30 text-sm mt-2">위의 '이미지 선택' 버튼을 클릭하여 이미지를 추가하세요.</p>
                    </div>
                  )}
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

      {/* 이미지 모달 */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-t-xl p-4">
              <h3 className="text-white font-semibold">{selectedImage.originalName}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={zoomOut}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="축소"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={zoomIn}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="확대"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={rotateImage}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="회전"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={closeImageModal}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                  title="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 이미지 컨테이너 */}
            <div className="flex-1 bg-black/50 rounded-b-xl overflow-hidden flex items-center justify-center relative">
              {/* 이전 버튼 */}
              {propertyImages.length > 1 && (
                <button
                  onClick={goToPreviousImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  title="이전 이미지 (←)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* 다음 버튼 */}
              {propertyImages.length > 1 && (
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
                  title="다음 이미지 (→)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <img
                src={selectedImage.filePath}
                alt={selectedImage.originalName}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${imageScale}) rotate(${imageRotation}deg)`
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDMwIDEwMEMxMzAgMTE2LjU2OSAxMTYuNTY5IDEzMCAxMDAgMTMwQzgzLjQzMSAxMzAgNzAgMTE2LjU2OSA3MCAxMEM3MCA4My40MzEgODMuNDMxIDcwIDEwMCA3MFoiIGZpbGw9IiM2NjY2NjYiLz4KPC9zdmc+';
                }}
              />
            </div>

            {/* 이미지 정보 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-b-xl p-4">
              <div className="flex items-center justify-between text-white/80 text-sm">
                <div className="flex items-center space-x-4">
                  <span>확대: {Math.round(imageScale * 100)}%</span>
                  <span>회전: {imageRotation}°</span>
                  {propertyImages.length > 1 && (
                    <span>
                      {propertyImages.findIndex(img => img.id === selectedImage.id) + 1} / {propertyImages.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {selectedImage.isMainImage && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      메인 이미지
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;