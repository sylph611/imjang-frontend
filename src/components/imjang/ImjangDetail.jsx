import React, { useState, useEffect } from 'react';
import { ChevronRight, MapPin, Calendar, Star, Edit, Trash2, Home } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Header from '../common/Header';

const ImjangDetail = () => {
  const { selectedImjang, imjangDetails, setCurrentView, fetchImjangDetail } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (selectedImjang) {
        setLoading(true);
        await fetchImjangDetail(selectedImjang);
        setLoading(false);
      }
    };
    loadDetail();
  }, [selectedImjang, fetchImjangDetail]);

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

  const detail = imjangDetails;
  if (!detail) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case '관심': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case '검토중': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case '보류': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
                  <div className="flex justify-between">
                    <span>면적</span>
                    <span>{detail.details.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>층수</span>
                    <span>{detail.details.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>방향</span>
                    <span>{detail.details.direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>주차</span>
                    <span>{detail.details.parking}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>관리비</span>
                    <span>{detail.details.maintenance}</span>
                  </div>
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
                  <span>임장일: {detail.date}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">장점</h3>
                <ul className="space-y-2">
                  {detail.details.pros.map((pro, index) => (
                    <li key={index} className="text-green-300 flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">단점</h3>
                <ul className="space-y-2">
                  {detail.details.cons.map((con, index) => (
                    <li key={index} className="text-red-300 flex items-start">
                      <span className="text-red-400 mr-2">✗</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">메모</h3>
            <p className="text-white/80 leading-relaxed">{detail.details.memo}</p>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <button className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-blue-500/30">
              <Edit className="w-4 h-4" />
              <span>수정</span>
            </button>
            <button className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl transition-all flex items-center space-x-2 border border-red-500/30">
              <Trash2 className="w-4 h-4" />
              <span>삭제</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImjangDetail;