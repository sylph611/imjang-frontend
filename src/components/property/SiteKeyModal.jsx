import React, { useState } from 'react';

const SITE_TYPES = [
  { label: '직방', value: '직방' },
  { label: '다방', value: '다방' },
  { label: 'KB부동산', value: 'KB부동산' },
  // 필요시 추가
];

const emptyKey = {
  id: null,
  siteType: '',
  siteKey: '',
  baseUrl: '',
  isActive: true
};

const SiteKeyModal = ({ open, onClose, siteKeys = [], onSave, propertyId }) => {
  const [editList, setEditList] = useState(siteKeys.length > 0 ? siteKeys : [emptyKey]);

  // 입력값 변경 핸들러
  const handleChange = (idx, field, value) => {
    setEditList(list => list.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // 새 키 추가
  const handleAdd = () => {
    setEditList(list => [...list, { ...emptyKey }]);
  };

  // 키 삭제
  const handleDelete = (idx) => {
    setEditList(list => list.filter((_, i) => i !== idx));
  };

  // 저장
  const handleSave = () => {
    // 유효성 검사(사이트 종류/키값 필수)
    if (editList.some(k => !k.siteType || !k.siteKey)) {
      alert('사이트 종류와 키값을 모두 입력하세요.');
      return;
    }
    onSave(editList);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative animate-fade-in">
        <h2 className="text-xl font-bold mb-4">크롤링 키 관리</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {editList.map((key, idx) => (
            <div key={idx} className="flex items-center space-x-2 border-b pb-2">
              <select
                className="border rounded px-2 py-1"
                value={key.siteType}
                onChange={e => handleChange(idx, 'siteType', e.target.value)}
              >
                <option value="">사이트 선택</option>
                {SITE_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="사이트 고유 키값"
                value={key.siteKey}
                onChange={e => handleChange(idx, 'siteKey', e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Base URL"
                value={key.baseUrl}
                onChange={e => handleChange(idx, 'baseUrl', e.target.value)}
              />
              <label className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={key.isActive}
                  onChange={e => handleChange(idx, 'isActive', e.target.checked)}
                />
                <span className="text-xs">활성</span>
              </label>
              <button
                className="text-red-500 hover:underline text-xs"
                onClick={() => handleDelete(idx)}
                type="button"
              >삭제</button>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button className="btn-secondary" onClick={handleAdd} type="button">+ 추가</button>
          <div className="space-x-2">
            <button className="btn-secondary" onClick={onClose} type="button">취소</button>
            <button className="btn-primary" onClick={handleSave} type="button">저장</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteKeyModal; 