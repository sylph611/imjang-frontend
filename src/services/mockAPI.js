// Mock API functions (실제로는 백엔드 API와 통신)
export const mockAPI = {
  login: async (email, password) => {
    // 실제로는 서버에 요청
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email === 'test@test.com' && password === 'password') {
      return { 
        token: 'mock-jwt-token', 
        user: { name: '김부동산', email } 
      };
    }
    throw new Error('로그인 실패');
  },
  
  getImjangList: async (token) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 1,
        title: '강남구 역삼동 오피스텔',
        address: '서울시 강남구 역삼동 123-45',
        price: '5억 2천',
        date: '2024-06-15',
        rating: 4,
        status: '검토중',
        images: 3
      },
      {
        id: 2,
        title: '서초구 반포동 아파트',
        address: '서울시 서초구 반포동 67-89',
        price: '12억',
        date: '2024-06-10',
        rating: 5,
        status: '관심',
        images: 8
      },
      {
        id: 3,
        title: '송파구 잠실동 상가',
        address: '서울시 송파구 잠실동 100-1',
        price: '3억 8천',
        date: '2024-06-08',
        rating: 3,
        status: '보류',
        images: 5
      }
    ];
  },
  
  getImjangDetail: async (id, token) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 실제로는 id에 따라 다른 데이터를 반환
    const mockDetails = {
      1: {
        id: 1,
        title: '강남구 역삼동 오피스텔',
        address: '서울시 강남구 역삼동 123-45',
        price: '5억 2천',
        date: '2024-06-15',
        rating: 4,
        status: '검토중',
        images: 3,
        details: {
          area: '84㎡ (25.4평)',
          floor: '15층 / 20층',
          direction: '남향',
          parking: '1대',
          maintenance: '15만원',
          pros: ['지하철 2호선 역삼역 도보 5분', '주변 상권 발달', '신축 건물'],
          cons: ['소음 약간 있음', '주차 공간 협소'],
          memo: '전반적으로 괜찮은 물건. 가격 협상 여지 있어 보임. 관리사무소 직원 친절함.'
        }
      },
      2: {
        id: 2,
        title: '서초구 반포동 아파트',
        address: '서울시 서초구 반포동 67-89',
        price: '12억',
        date: '2024-06-10',
        rating: 5,
        status: '관심',
        images: 8,
        details: {
          area: '114㎡ (34.5평)',
          floor: '8층 / 15층',
          direction: '남동향',
          parking: '2대',
          maintenance: '25만원',
          pros: ['한강 조망', '학군 우수', '대형 평형', '리모델링 완료'],
          cons: ['관리비 높음'],
          memo: '최고급 아파트. 가족이 살기에 완벽한 조건. 투자 가치도 높음.'
        }
      },
      3: {
        id: 3,
        title: '송파구 잠실동 상가',
        address: '서울시 송파구 잠실동 100-1',
        price: '3억 8천',
        date: '2024-06-08',
        rating: 3,
        status: '보류',
        images: 5,
        details: {
          area: '45㎡ (13.6평)',
          floor: '1층',
          direction: '동향',
          parking: '불가',
          maintenance: '8만원',
          pros: ['유동인구 많음', '대로변 위치'],
          cons: ['주차 불가', '임대료 높음', '경쟁업체 많음'],
          memo: '장사하기엔 좋은 위치이지만 주차 문제와 높은 임대료가 걸림돌.'
        }
      }
    };
    
    return mockDetails[id] || mockDetails[1];
  },

  createImjang: async (imjangData, token) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // 새로운 ID 생성 (실제로는 서버에서 생성)
    const newId = Date.now();
    return {
      id: newId,
      ...imjangData,
      images: 0 // 새로 생성시에는 이미지 0개
    };
  }
};