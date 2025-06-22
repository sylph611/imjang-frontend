import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Search, MapPin } from 'lucide-react';

const AddressSearch = ({ 
  value = '', 
  onChange, 
  onLocationSelect, 
  placeholder = "주소, 건물명, 지역명을 입력하세요...",
  disabled = false 
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isComposing, setIsComposing] = useState(false); // 한글 조합 상태
  
  // 함수들을 ref로 저장하여 useEffect 재실행 방지
  const onChangeRef = useRef(onChange);
  const onLocationSelectRef = useRef(onLocationSelect);
  
  // 함수 업데이트
  useEffect(() => {
    onChangeRef.current = onChange;
    onLocationSelectRef.current = onLocationSelect;
  }, [onChange, onLocationSelect]);

  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
          setError('Google Maps API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_GOOGLE_MAPS_API_KEY를 설정해주세요.');
          setIsLoading(false);
          return;
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const google = await loader.load();

        // Legacy Autocomplete API 사용 (현재 안정적)
        // 경고 메시지는 표시되지만 기능은 정상 작동
        const options = {
          componentRestrictions: { country: 'kr' }
          // types 제거하여 모든 타입 허용 (주소, 건물명, 지역명 등)
        };

        const autocomplete = new google.maps.places.Autocomplete(
          inputRef.current,
          options
        );

        // 더 많은 필드를 가져와서 정확한 정보 제공
        autocomplete.setFields([
          'formatted_address', 
          'geometry', 
          'name',
          'place_id',
          'types',
          'address_components'
        ]);

        autocompleteRef.current = autocomplete;

        // 주소 선택 이벤트
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry) {
            setError('목록에서 정확한 주소를 선택해주세요.');
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          // 주소 정보 처리
          let address = '';
          
          // 1. formatted_address가 있으면 우선 사용
          if (place.formatted_address) {
            address = place.formatted_address;
          }
          // 2. name이 있고 formatted_address가 없으면 name 사용
          else if (place.name) {
            address = place.name;
          }
          // 3. 둘 다 없으면 주소 컴포넌트로 조합
          else if (place.address_components && place.address_components.length > 0) {
            const addressParts = [];
            
            // 한국 주소 형식에 맞게 조합
            place.address_components.forEach(component => {
              if (component.types.includes('street_number') || 
                  component.types.includes('route') ||
                  component.types.includes('sublocality_level_1') ||
                  component.types.includes('locality') ||
                  component.types.includes('administrative_area_level_1')) {
                addressParts.push(component.long_name);
              }
            });
            
            if (addressParts.length > 0) {
              address = addressParts.join(' ');
            }
          }

          // 주소가 비어있으면 에러
          if (!address.trim()) {
            setError('주소 정보를 가져올 수 없습니다.');
            return;
          }

          // 위치 정보 전달
          if (onLocationSelectRef.current) {
            onLocationSelectRef.current({
              latitude: lat,
              longitude: lng,
              address: address.trim()
            });
          }

          // 입력 필드의 값도 선택된 주소로 업데이트
          if (onChangeRef.current) {
            onChangeRef.current(address.trim());
          }

          setError(null);
        });

        setIsLoading(false);
      } catch (err) {
        // console.error('Google Places API 로딩 실패:', err);
        if (err.message.includes('InvalidKeyMapError')) {
          setError('Google Maps API 키가 유효하지 않습니다. 올바른 API 키를 설정해주세요.');
        } else if (err.message.includes('LegacyApiNotActivatedMapError')) {
          setError('Google Maps API 설정이 필요합니다. Google Cloud Console에서 Places API를 활성화해주세요.');
        } else {
          setError('주소 검색 기능을 불러올 수 없습니다.');
        }
        setIsLoading(false);
      }
    };

    if (!disabled) {
      initAutocomplete();
    }

    return () => {
      // cleanup: autocomplete 인스턴스 참조 제거
      autocompleteRef.current = null;
    };
  }, [disabled]);

  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setError(null);

    // 디바운싱을 제거하고 모든 입력(영어, 한글 조합 중, 지우기)을 즉시 반영합니다.
    if (onChangeRef.current) {
      onChangeRef.current(newValue);
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Enter 키를 누를 때의 디바운싱 취소 로직은 더 이상 필요하지 않습니다.
    }
  }, []);

  // 한글 조합 이벤트 핸들러
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionUpdate = useCallback(() => {
    // 조합 업데이트 중에는 아무것도 하지 않음 (onChange가 이미 처리)
  }, []);

  const handleCompositionEnd = useCallback((e) => {
    setIsComposing(false);
    // 조합이 완료되면 즉시 onChange가 호출되도록 보장합니다.
    // handleInputChange가 이미 처리하지만, IME 동작 차이를 고려해 안전장치로 둡니다.
    if (onChangeRef.current) {
      onChangeRef.current(e.target.value);
    }
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/50" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionUpdate={handleCompositionUpdate}
          onCompositionEnd={handleCompositionEnd}
          disabled={disabled || isLoading}
          className={`
            block w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50
            ${disabled || isLoading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'focus:ring-2 focus:ring-blue-400 focus:border-blue-400'
            }
            ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}
          `}
          placeholder={isLoading ? "주소 검색 로딩 중..." : placeholder}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-400 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {!error && !isLoading && (
        <div className="mt-2 text-sm text-white/50 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          주소, 건물명, 지역명을 자유롭게 입력하세요
        </div>
      )}
    </div>
  );
};

export default AddressSearch; 