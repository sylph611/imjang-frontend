import React, { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Calendar, Star, Edit, Trash2, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';
import { api } from '../../services/mockAPI';

const PropertyDetail = () => {
  const { selectedProperty, propertyDetails, setCurrentView, fetchPropertyDetail, token } = useApp();
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
        area: propertyDetails.details?.area || '',
        floor: propertyDetails.details?.floor || '',
        direction: propertyDetails.details?.direction || '',
        parking: propertyDetails.details?.parking || '',
        maintenance: propertyDetails.details?.maintenance || '',
        pros: propertyDetails.advantages ? [...propertyDetails.advantages] : [''],
        cons: propertyDetails.disadvantages ? [...propertyDetails.disadvantages] : [''],
        memo: propertyDetails.details?.memo || ''
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
      await api.deleteProperty(detail.id, token);
      setCurrentView('list');
    } catch (e) {
      setError("삭제 실패");
    }
  };

  // 수정 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      title: form.title,
      address: form.address,
      price: form.price,
      date: form.date,
      rating: form.rating,
      status: form.status,
      advantages: form.pros.filter(item => item.trim() !== ''),
      disadvantages: form.cons.filter(item => item.trim() !== ''),
      details: {
        area: form.area,
        floor: form.floor,
        direction: form.direction,
        parking: form.parking,
        maintenance: form.maintenance,
        memo: form.memo
      }
    };
    try {
      await api.updateProperty(detail.id, dataToSave, token);
      await fetchPropertyDetail(detail.id);
      setIsEditing(false);
    } catch (e) {
      setError("수정 실패");
    }
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
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Home className="w-5 h-5 mr-2" />
                      기본 정보
                    </h3>
                    <div className="space-y-3 text-white/80">
                      <div className="flex justify-between items-center">
                        <span>가격</span>
                        <input
                          name="price"
                          value={form.price}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>면적</span>
                        <input
                          name="area"
                          value={form.area}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>층수</span>
                        <input
                          name="floor"
                          value={form.floor}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>방향</span>
                        <input
                          name="direction"
                          value={form.direction}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>주차</span>
                        <input
                          name="parking"
                          value={form.parking}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span>관리비</span>
                        <input
                          name="maintenance"
                          value={form.maintenance}
                          onChange={handleChange}
                          className="input-glass text-right text-white w-60"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      평가
                    </h3>
                    <div className="flex items-center mb-4">
                      {[1,2,3,4,5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, rating }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${rating <= form.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'} hover:text-yellow-300 transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-white font-semibold">{form.rating}/5</span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <input
                        name="date"
                        type="date"
                        value={form.date}
                        onChange={handleChange}
                        className="bg-transparent border-b border-white/30 focus:outline-none focus:border-blue-400 text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">장점</h3>
                    {form.pros && form.pros.length > 0 && (
                      <ul className="space-y-2">
                        {form.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="text-green-400">✓</span>
                            <input
                              type="text"
                              value={pro}
                              onChange={e => handleArrayChange('pros', idx, e.target.value)}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="장점을 입력하세요"
                            />
                            {form.pros.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('pros', idx)} className="text-red-400 hover:text-red-300 p-1">×</button>
                            )}
                          </li>
                        ))}
                        <li>
                          <button type="button" onClick={() => addArrayItem('pros')} className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm transition-all">추가</button>
                        </li>
                      </ul>
                    )}
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">단점</h3>
                    {form.cons && form.cons.length > 0 && (
                      <ul className="space-y-2">
                        {form.cons.map((con, idx) => (
                          <li key={idx} className="flex items-center space-x-2">
                            <span className="text-red-400">✗</span>
                            <input
                              type="text"
                              value={con}
                              onChange={e => handleArrayChange('cons', idx, e.target.value)}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              placeholder="단점을 입력하세요"
                            />
                            {form.cons.length > 1 && (
                              <button type="button" onClick={() => removeArrayItem('cons', idx)} className="text-red-400 hover:text-red-300 p-1">×</button>
                            )}
                          </li>
                        ))}
                        <li>
                          <button type="button" onClick={() => addArrayItem('cons')} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm transition-all">추가</button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
                <textarea
                  name="memo"
                  value={form.memo}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  placeholder="매물 시 느낀 점이나 추가 정보를 자유롭게 작성하세요"
                />
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
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Home className="w-5 h-5 mr-2" />
                      기본 정보
                    </h3>
                    <div className="space-y-3 text-white/80">
                      <div className="flex justify-between">
                        <span>가격</span>
                        <span className="font-semibold text-white">{detail.price}</span>
                      </div>
                      {detail.details?.area && (
                        <div className="flex justify-between">
                          <span>면적</span>
                          <span>{detail.details.area}</span>
                        </div>
                      )}
                      {detail.details?.floor && (
                        <div className="flex justify-between">
                          <span>층수</span>
                          <span>{detail.details.floor}</span>
                        </div>
                      )}
                      {detail.details?.direction && (
                        <div className="flex justify-between">
                          <span>방향</span>
                          <span>{detail.details.direction}</span>
                        </div>
                      )}
                      {detail.details?.parking && (
                        <div className="flex justify-between">
                          <span>주차</span>
                          <span>{detail.details.parking}</span>
                        </div>
                      )}
                      {detail.details?.maintenance && (
                        <div className="flex justify-between">
                          <span>관리비</span>
                          <span>{detail.details.maintenance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      평가
                    </h3>
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${i < detail.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                        />
                      ))}
                      <span className="ml-2 text-white font-semibold">{detail.rating}/5</span>
                    </div>
                    <div className="flex items-center text-white/70 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>매물일: {detail.date}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
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
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
                <p className="text-white/80 leading-relaxed">
                  {detail.details?.memo || '등록된 메모가 없습니다.'}
                </p>
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