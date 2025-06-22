import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Home, Star } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/mockAPI';

const PropertyMapView = () => {
  const { setCurrentView, setSelectedProperty, token } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [propertiesInBounds, setPropertiesInBounds] = useState([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const mapRef = useRef(null);
  const googleRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map()); // Map 객체로 변경하여 효율적인 마커 관리
  const infoWindowRef = useRef(null);
  const idleListenerRef = useRef(null);
  const lastBoundsRef = useRef(null); // 마지막 bounds 저장

  // 디바운싱을 위한 타이머
  const debounceTimerRef = useRef(null);

  const fetchPropertiesAndDrawMarkers = useCallback(async (map) => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const bounds = map.getBounds();
      if (!bounds) {
        setLoading(false);
        return;
      }

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      // bounds가 크게 변경되지 않았다면 스킵 (더 엄격한 조건으로 변경)
      if (lastBoundsRef.current) {
        const lastNe = lastBoundsRef.current.getNorthEast();
        const lastSw = lastBoundsRef.current.getSouthWest();
        
        // bounds 변화가 5% 미만이면 스킵 (10%에서 5%로 변경)
        const latDiff = Math.abs(ne.lat() - lastNe.lat()) / Math.abs(lastNe.lat() - lastSw.lat());
        const lngDiff = Math.abs(ne.lng() - lastNe.lng()) / Math.abs(lastNe.lng() - lastSw.lng());
        
        if (latDiff < 0.05 && lngDiff < 0.05) {
          return;
        }
      }
      
      lastBoundsRef.current = bounds;
      
      setLoading(true);
      const properties = await api.getPropertiesInBounds(sw.lat(), ne.lat(), sw.lng(), ne.lng(), token);
      
      // 기존 마커 중 범위를 벗어난 것들만 제거
      const newPropertyIds = new Set(properties.map(p => p.id));
      const markersToRemove = [];
      
      markersRef.current.forEach((marker, propertyId) => {
        if (!newPropertyIds.has(propertyId)) {
          markersToRemove.push(propertyId);
        }
      });
      
      // 범위를 벗어난 마커들 제거
      markersToRemove.forEach(propertyId => {
        const marker = markersRef.current.get(propertyId);
        if (marker) {
          marker.setMap(null);
          markersRef.current.delete(propertyId);
        }
      });

      // 새로운 매물들에 대한 마커 추가
      properties.forEach(property => {
        if (!markersRef.current.has(property.id)) {
          const marker = new googleRef.current.maps.Marker({
            position: { lat: property.latitude, lng: property.longitude },
            map: map,
            title: property.title,
            icon: {
              // 더 크고 밝은 핀 아이콘으로 변경 (그림자 효과 포함)
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDhweCIgaGVpZ2h0PSI0OHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzIi8+CjxmZU9mZnNldCBkeD0iMiIgZHk9IjIiLz4KPGZlQ29tcG9zaXRlIGluMj0iU291cmNlQWxwaGEiIG9wZXJhdG9yPSJpbiIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI0ZGRkZGRiIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KPHBhdGggZD0iTTI0LDhDMTguNDcsOCwxNCwxMi40NywxNCwxOEMxNCwyNS4zLDI0LDM4LDI0LDM4UzM0LDI1LjMsMzQsMThDMzQsMTIuNDcsMjkuNTMsOCwyNCw4WiIgZmlsbD0iI0ZGNjY2NiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjE4IiByPSI1IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=',
              scaledSize: new googleRef.current.maps.Size(48, 48),
              anchor: new googleRef.current.maps.Point(24, 48)
            },
            // 마커에 애니메이션 효과 추가
            animation: googleRef.current.maps.Animation.DROP
          });

          // 마커 호버 효과
          marker.addListener('mouseover', () => {
            marker.setIcon({
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTZweCIgaGVpZ2h0PSI1NnB4IiB2aWV3Qm94PSIwIDAgNTYgNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSI0Ii8+CjxmZU9mZnNldCBkeD0iMyIgZHk9IjMiLz4KPGZlQ29tcG9zaXRlIGluMj0iU291cmNlQWxwaGEiIG9wZXJhdG9yPSJpbiIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8Y2lyY2xlIGN4PSIyOCIgY3k9IjI4IiByPSIyOCIgZmlsbD0iI0ZGRkZGRiIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KPHBhdGggZD0iTTI4LDEwQzIxLjM3LDEwLDE2LDE1LjM3LDE2LDIyQzE2LDMwLjUsMjgsNDQsMjgsNDRTNDAsMzAuNSw0MCwyMkM0MCwxNS4zNywzNC42MywxMCwyOCwxMFoiIGZpbGw9IiNGRjMzMzMiLz4KPGNpcmNsZSBjeD0iMjgiIGN5PSIyMiIgcj0iNiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K',
              scaledSize: new googleRef.current.maps.Size(56, 56),
              anchor: new googleRef.current.maps.Point(28, 56)
            });
          });

          marker.addListener('mouseout', () => {
            marker.setIcon({
              url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDhweCIgaGVpZ2h0PSI0OHB4IiB2aWV3Qm94PSIwIDAgNDggNDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8ZmlsdGVyIGlkPSJzaGFkb3ciIHg9Ii0yMCUiIHk9Ii0yMCUiIHdpZHRoPSIxNDAlIiBoZWlnaHQ9IjE0MCUiPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIzIi8+CjxmZU9mZnNldCBkeD0iMiIgZHk9IjIiLz4KPGZlQ29tcG9zaXRlIGluMj0iU291cmNlQWxwaGEiIG9wZXJhdG9yPSJpbiIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyNCIgZmlsbD0iI0ZGRkZGRiIgZmlsdGVyPSJ1cmwoI3NoYWRvdykiLz4KPHBhdGggZD0iTTI0LDhDMTguNDcsOCwxNCwxMi40NywxNCwxOEMxNCwyNS4zLDI0LDM4LDI0LDM4UzM0LDI1LjMsMzQsMThDMzQsMTIuNDcsMjkuNTMsOCwyNCw4WiIgZmlsbD0iI0ZGNjY2NiIvPgo8Y2lyY2xlIGN4PSIyNCIgY3k9IjE4IiByPSI1IiBmaWxsPSIjRkZGRkZGIi8+Cjwvc3ZnPgo=',
              scaledSize: new googleRef.current.maps.Size(48, 48),
              anchor: new googleRef.current.maps.Point(24, 48)
            });
          });

          // 마커 클릭 이벤트
          marker.addListener('click', () => {
            const infoWindow = new googleRef.current.maps.InfoWindow({
              content: `
                <div style="padding: 10px; max-width: 250px; font-family: Arial, sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #333;">${property.title}</h3>
                  <p style="margin: 0 0 5px 0; font-size: 12px; color: #666;">
                    <span style="color: #3b82f6; font-weight: bold;">${property.price}</span>
                  </p>
                  <p style="margin: 0 0 5px 0; font-size: 11px; color: #666;">
                    <span style="color: #10b981;">★</span> ${property.rating} • ${property.roomCount}룸
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #666; line-height: 1.3;">
                    ${property.address}
                  </p>
                  <button 
                    onclick="window.openPropertyDetail('${property.id}')"
                    style="margin-top: 8px; padding: 4px 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;"
                  >
                    상세보기
                  </button>
                </div>
              `
            });
            
            infoWindow.open(map, marker);
            
            // 3초 후 자동으로 닫기
            setTimeout(() => {
              infoWindow.close();
            }, 3000);
          });

          markersRef.current.set(property.id, marker);
        }
      });

      setPropertiesInBounds(properties);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      try {
        setLoading(true);
        const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'YOUR_API_KEY') {
          throw new Error('Google Maps API 키가 설정되지 않았습니다.');
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'marker'],
        });

        const google = await loader.load();
        googleRef.current = google;
        
        const setDefaultMap = (center) => {
          const map = new google.maps.Map(mapRef.current, {
            center: center,
            zoom: 14,
            styles: [
              {
                featureType: 'all',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#ffffff' }]
              },
              {
                featureType: 'all',
                elementType: 'labels.text.stroke',
                stylers: [{ color: '#000000' }, { lightness: 13 }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }]
              },
              {
                featureType: 'landscape',
                elementType: 'all',
                stylers: [{ color: '#08304b' }]
              },
              {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{ color: '#0c4152' }, { lightness: 5 }]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b434f' }, { lightness: 25 }]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.fill',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'road.arterial',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
              },
              {
                featureType: 'road.local',
                elementType: 'geometry',
                stylers: [{ color: '#000000' }]
              },
              {
                featureType: 'transit',
                elementType: 'all',
                stylers: [{ color: '#146474' }]
              },
              {
                featureType: 'water',
                elementType: 'all',
                stylers: [{ color: '#021019' }]
              }
            ]
          });
          
          mapInstanceRef.current = map;
          
          google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
            if (isMounted) {
              fetchPropertiesAndDrawMarkers(map);
            }
          });
          
          // 디바운싱된 idle 이벤트 리스너
          if (idleListenerRef.current) {
            google.maps.event.removeListener(idleListenerRef.current);
          }
          
          idleListenerRef.current = map.addListener('idle', () => {
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }
            
            debounceTimerRef.current = setTimeout(() => {
              if (isMounted) {
                fetchPropertiesAndDrawMarkers(map);
              }
            }, 300); // 300ms 디바운싱
          });
          
          // 지도 이동 이벤트도 추가
          map.addListener('bounds_changed', () => {
          });

          map.addListener('dragend', () => {
          });

          map.addListener('zoom_changed', () => {
          });
          
          // 초기 로드 - 지도가 완전히 로드된 후 실행
          setTimeout(() => {
            if (isMounted) {
              fetchPropertiesAndDrawMarkers(map);
            }
          }, 1000);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => setDefaultMap({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => setDefaultMap({ lat: 37.5665, lng: 126.9780 })
          );
        } else {
          setDefaultMap({ lat: 37.5665, lng: 126.9780 });
        }

        // 전역 함수 등록 (InfoWindow에서 사용)
        window.openPropertyDetail = (propertyId) => {
          setSelectedProperty(propertyId);
          setCurrentView('detail');
        };

        setMapInitialized(true);
      } catch (err) {
        if (isMounted) setError(err.message);
        setLoading(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (idleListenerRef.current && googleRef.current) {
        googleRef.current.maps.event.removeListener(idleListenerRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // 전역 함수 제거
      delete window.openPropertyDetail;
    };
  }, [token, setCurrentView, setSelectedProperty, fetchPropertiesAndDrawMarkers]);

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-100 text-sm mb-4">
          {error}
        </div>
      )}

      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-[600px] rounded-2xl overflow-hidden"
        />
        
        {loading && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 z-10">
            <div className="flex items-center space-x-2 text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">매물 조회 중...</span>
            </div>
          </div>
        )}

        {/* 매물 개수 표시 */}
        {propertiesInBounds.length > 0 && (
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 z-10">
            <div className="flex items-center space-x-2 text-white">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">
                현재 범위: {propertiesInBounds.length}개 매물
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 매물이 없을 때 안내 메시지 */}
      {propertiesInBounds.length === 0 && !loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-xl p-6 z-10">
          <div className="text-center text-white">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-white/50" />
            <h3 className="text-lg font-semibold mb-2">현재 지도 범위에 매물이 없습니다</h3>
            <p className="text-white/70 text-sm">지도를 이동하거나 확대/축소하여 다른 지역의 매물을 확인해보세요</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyMapView; 