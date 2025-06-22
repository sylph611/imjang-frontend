import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({ 
  latitude, 
  longitude, 
  address, 
  onLocationSelect, 
  height = "400px",
  showMarker = true,
  draggable = false 
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
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
        
        // 기본 위치 설정 (서울 시청)
        const defaultLocation = { lat: 37.5665, lng: 126.9780 };
        const mapLocation = latitude && longitude 
          ? { lat: parseFloat(latitude), lng: parseFloat(longitude) }
          : defaultLocation;

        // 새로운 Maps JavaScript API 사용
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: mapLocation,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        setMap(mapInstance);

        // 마커 추가
        if (showMarker && latitude && longitude) {
          const marker = new google.maps.Marker({
            position: mapLocation,
            map: mapInstance,
            draggable: draggable,
            title: address || '매물 위치'
          });

          markerRef.current = marker;

          // 마커 드래그 이벤트
          if (draggable && onLocationSelect) {
            marker.addListener('dragend', () => {
              const position = marker.getPosition();
              onLocationSelect({
                latitude: position.lat(),
                longitude: position.lng()
              });
            });
          }

          // 마커 클릭 시 정보창
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 10px;">
              <h3 style="margin: 0 0 5px 0; font-size: 14px;">매물 위치</h3>
              <p style="margin: 0; font-size: 12px;">${address || '주소 정보 없음'}</p>
            </div>`
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstance, marker);
          });
        }

        // 지도 클릭 이벤트 (드래그 가능한 경우)
        if (draggable && onLocationSelect) {
          mapInstance.addListener('click', (event) => {
            const position = event.latLng;
            
            // 기존 마커 제거
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 새 마커 추가
            const newMarker = new google.maps.Marker({
              position: position,
              map: mapInstance,
              draggable: true,
              title: '선택된 위치'
            });

            markerRef.current = newMarker;

            // 위치 정보 전달
            onLocationSelect({
              latitude: position.lat(),
              longitude: position.lng()
            });
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Google Maps 로딩 실패:', err);
        if (err.message.includes('InvalidKeyMapError')) {
          setError('Google Maps API 키가 유효하지 않습니다. 올바른 API 키를 설정해주세요.');
        } else if (err.message.includes('LegacyApiNotActivatedMapError')) {
          setError('Google Maps API 설정이 필요합니다. Google Cloud Console에서 Maps JavaScript API를 활성화해주세요.');
        } else {
          setError('지도를 불러올 수 없습니다.');
        }
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // 좌표가 변경될 때 지도 중심과 마커 위치를 업데이트합니다.
  useEffect(() => {
    if (map && latitude && longitude) {
      const newPosition = { 
        lat: parseFloat(latitude), 
        lng: parseFloat(longitude) 
      };
      
      map.setCenter(newPosition);
      map.setZoom(15);
      
      if (markerRef.current) {
        markerRef.current.setPosition(newPosition);
      } else if (showMarker) {
        // 이전에 마커가 없었다면 새로 생성
        const marker = new window.google.maps.Marker({
          position: newPosition,
          map: map,
          draggable: draggable,
          title: address || '매물 위치'
        });
        markerRef.current = marker;

        if (draggable && onLocationSelect) {
            marker.addListener('dragend', () => {
              const position = marker.getPosition();
              onLocationSelect({
                latitude: position.lat(),
                longitude: position.lng()
              });
            });
          }
      }
    }
  }, [map, latitude, longitude, address, draggable, showMarker, onLocationSelect]);

  if (error) {
    return (
      <div 
        className="glass-effect rounded-xl p-6 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-white/80">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-all border border-blue-500/30"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl z-10"
        >
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
            <p className="text-sm">지도 로딩 중...</p>
          </div>
        </div>
      )}
      <div 
        ref={mapRef} 
        className="rounded-xl border border-white/20 overflow-hidden"
        style={{ height, width: '100%' }}
      />
    </div>
  );
};

export default GoogleMap; 