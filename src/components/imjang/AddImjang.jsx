import React, { useState } from 'react';
import { ChevronRight, Plus, Save, X, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';

const AddImjang = () => {
  const { setCurrentView, addImjang } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    date: new Date().toISOString().split('T')[0], // 오늘 날짜로 초기화
    rating: 3,
    status: '검토중',
    area: '',
    floor: '',
    direction: '',
    parking: '',
    maintenance: '',
    pros: [''],
    cons: [''],
    memo: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      await addImjang(formData);
      setCurrentView('list');
    } catch (error) {
      alert('임장 기록 저장에 실패했습니다.');
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
          <h1 className="text-3xl font-bold text-white mb-8">새 임장 기록 등록</h1>
          
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
                      <label className="block text-white/80 text-sm mb-2">임장일</label>
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
                  <h3 className="text-xl font-semibold text-white mb-4">상세 정보</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">면적</label>
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className="input-glass"
                        placeholder="예: 84㎡ (25.4평)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">층수</label>
                      <input
                        type="text"
                        value={formData.floor}
                        onChange={(e) => handleInputChange('floor', e.target.value)}
                        className="input-glass"
                        placeholder="예: 15층 / 20층"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">방향</label>
                      <input
                        type="text"
                        value={formData.direction}
                        onChange={(e) => handleInputChange('direction', e.target.value)}
                        className="input-glass"
                        placeholder="예: 남향"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">주차</label>
                      <input
                        type="text"
                        value={formData.parking}
                        onChange={(e) => handleInputChange('parking', e.target.value)}
                        className="input-glass"
                        placeholder="예: 1대"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm mb-2">관리비</label>
                      <input
                        type="text"
                        value={formData.maintenance}
                        onChange={(e) => handleInputChange('maintenance', e.target.value)}
                        className="input-glass"
                        placeholder="예: 15만원"
                      />
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
                  onClick={() => addArrayItem('pros')}
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-300 px-3 py-1 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  추가
                </button>
              </div>
              <div className="space-y-3">
                {formData.pros.map((pro, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <input
                      type="text"
                      value={pro}
                      onChange={(e) => handleArrayChange('pros', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="장점을 입력하세요"
                    />
                    {formData.pros.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('pros', index)}
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
                  onClick={() => addArrayItem('cons')}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  추가
                </button>
              </div>
              <div className="space-y-3">
                {formData.cons.map((con, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-red-400">✗</span>
                    <input
                      type="text"
                      value={con}
                      onChange={(e) => handleArrayChange('cons', index, e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="단점을 입력하세요"
                    />
                    {formData.cons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('cons', index)}
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
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                placeholder="임장 시 느낀 점이나 추가 정보를 자유롭게 작성하세요"
              />
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

export default AddImjang;