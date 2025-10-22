import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useIsMobile } from "../ui/use-mobile";
import {
  MapPin,
  Navigation,
  Maximize,
  Minimize,
  RotateCcw,
  Layers,
  Search,
  AlertTriangle,
} from "lucide-react";

interface MapContainerProps {
  height?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  routes?: MapRoute[];
  showTraffic?: boolean;
  showControls?: boolean;
  className?: string;
  onMapReady?: (map: google.maps.Map) => void;
}

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  type: "bus" | "stop" | "school" | "home" | "incident";
  icon?: string;
  info?: string;
  status?: "active" | "inactive" | "warning" | "danger";
}

interface MapRoute {
  id: string;
  path: { lat: number; lng: number }[];
  color: string;
  strokeWeight?: number;
  title: string;
}

export function MapContainer({
  height = "400px",
  center = { lat: 10.8231, lng: 106.6297 }, // TP.HCM
  zoom = 13,
  markers = [],
  routes = [],
  showTraffic = false,
  showControls = true,
  className = "",
  onMapReady,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const routesRef = useRef<google.maps.Polyline[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const isMobile = useIsMobile();

  // Load Google Maps API
  useEffect(() => {
    // Note: Using demo mode due to API key billing requirements
    // To use real Google Maps, you need to:
    // 1. Enable billing on your Google Cloud project
    // 2. Enable Maps JavaScript API
    // 3. Replace the API key below with your billing-enabled key
    const apiKey = ""; // Removed API key - using demo mode
    
    // If no valid API key, stay in demo mode
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
      setIsLoaded(false);
      return;
    }

    // Check if Google Maps is already loaded and fully available
    if (window.google?.maps?.MapTypeId && window.google?.maps?.Map) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Create a global callback function
    (window as any).initGoogleMaps = () => {
      // Wait a bit to ensure all Google Maps components are ready
      setTimeout(() => {
        if (window.google?.maps?.MapTypeId && 
            window.google?.maps?.Map && 
            window.google?.maps?.Marker &&
            window.google?.maps?.InfoWindow) {
          setIsLoaded(true);
        } else {
          console.warn("Google Maps API loaded but not fully available");
          setIsLoaded(false);
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.warn("Google Maps API failed to load - using demo mode:", error);
      setIsLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // Cleanup global callback
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    // Enhanced Google Maps API readiness check
    if (!window.google?.maps?.Map || !window.google?.maps?.MapTypeId || !window.google?.maps?.Marker) {
      console.warn("Google Maps API not fully loaded yet");
      return;
    }

    try {
      const mapOptions: google.maps.MapOptions = {
        center,
        zoom: currentZoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapId: "DEMO_MAP_ID", // Required for AdvancedMarkerElement in future
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      };

      mapInstanceRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions,
      );

      if (onMapReady) {
        onMapReady(mapInstanceRef.current);
      }

      // Listen to zoom changes with error handling
      if (mapInstanceRef.current.addListener && window.google?.maps?.event) {
        mapInstanceRef.current.addListener("zoom_changed", () => {
          try {
            if (mapInstanceRef.current) {
              setCurrentZoom(mapInstanceRef.current.getZoom() || zoom);
            }
          } catch (e) {
            console.warn("Failed to get zoom level:", e);
          }
        });
      }
    } catch (error) {
      console.warn("Failed to initialize Google Maps - using demo mode:", error);
      setIsLoaded(false);
    }
  }, [isLoaded, center, currentZoom, onMapReady]);

  // Update markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.google?.maps?.Map) return;

    try {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        if (marker && typeof marker.setMap === 'function') {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // Only add markers if we have a valid map instance and Google Maps is loaded
      if (markers.length > 0 && window.google?.maps?.Marker) {
        markers.forEach((markerData) => {
          let marker;

          try {
            // Use legacy Marker (google.maps.Marker is deprecated but still supported)
            // Note: For production, migrate to AdvancedMarkerElement with a billing-enabled API key
            // See: https://developers.google.com/maps/documentation/javascript/advanced-markers/migration
            marker = new window.google.maps.Marker({
              position: markerData.position,
              map: mapInstanceRef.current,
              title: markerData.title,
              icon: getMarkerIcon(
                markerData.type,
                markerData.status,
              ),
            });

            if (marker && markerData.info && window.google?.maps?.InfoWindow) {
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div class="p-2">
                    <h4 class="font-medium">${markerData.title}</h4>
                    <p class="text-sm text-gray-600">${markerData.info}</p>
                  </div>
                `,
              });

              // Use proper event listener with error handling
              if (marker.addListener && window.google?.maps?.event) {
                marker.addListener("click", () => {
                  try {
                    infoWindow.open(mapInstanceRef.current, marker);
                  } catch (e) {
                    console.warn("Failed to open info window:", e);
                  }
                });
              }
            }

            if (marker) {
              markersRef.current.push(marker);
            }
          } catch (markerError) {
            console.warn("Failed to create marker:", markerError);
          }
        });
      }
    } catch (error) {
      console.error("Failed to update markers:", error);
    }
  }, [isLoaded, markers]);

  // Update routes
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !window.google?.maps?.Polyline) return;

    try {
      // Clear existing routes
      routesRef.current.forEach((route) => {
        if (route && typeof route.setMap === 'function') {
          route.setMap(null);
        }
      });
      routesRef.current = [];

      // Only add routes if we have a valid map instance and Google Maps is loaded
      if (routes.length > 0) {
        routes.forEach((routeData) => {
          const polyline = new window.google.maps.Polyline({
            path: routeData.path,
            geodesic: true,
            strokeColor: routeData.color,
            strokeOpacity: 1.0,
            strokeWeight: routeData.strokeWeight || 3,
            map: mapInstanceRef.current,
          });

          routesRef.current.push(polyline);
        });
      }
    } catch (error) {
      console.error("Failed to update routes:", error);
    }
  }, [isLoaded, routes]);

  const getMarkerColor = (type: string, status?: string) => {
    switch (type) {
      case "bus":
        return status === "danger"
          ? "#ef4444"
          : status === "warning"
            ? "#f59e0b"
            : "#10b981";
      case "stop":
        return "#3b82f6";
      case "school":
        return "#8b5cf6";
      case "home":
        return "#ec4899";
      case "incident":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getMarkerSymbol = (type: string) => {
    switch (type) {
      case "bus":
        return "🚌";
      case "stop":
        return "🚏";
      case "school":
        return "🏫";
      case "home":
        return "🏠";
      case "incident":
        return "⚠️";
      default:
        return "📍";
    }
  };

  const getMarkerIcon = (type: string, status?: string) => {
    const baseUrl =
      "https://maps.google.com/mapfiles/ms/icons/";

    switch (type) {
      case "bus":
        return status === "danger"
          ? `${baseUrl}red-dot.png`
          : status === "warning"
            ? `${baseUrl}yellow-dot.png`
            : `${baseUrl}green-dot.png`;
      case "stop":
        return `${baseUrl}blue-dot.png`;
      case "school":
        return `${baseUrl}purple-dot.png`;
      case "home":
        return `${baseUrl}pink-dot.png`;
      case "incident":
        return `${baseUrl}red-dot.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  };

  const handleCenterMap = () => {
    if (isLoaded && mapInstanceRef.current && window.google?.maps) {
      try {
        mapInstanceRef.current.setCenter(center);
        mapInstanceRef.current.setZoom(zoom);
      } catch (error) {
        console.error("Failed to center map:", error);
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getMapHeight = () => {
    if (isFullscreen) return "100vh";
    return isMobile ? "300px" : height;
  };

  if (!isLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Bản đồ theo dõi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200"
            style={{ height: getMapHeight() }}
          >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <MapPin className="w-16 h-16 text-blue-600 mb-2" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-800">
                  Bản đồ mô phỏng
                </p>
                <p className="text-sm text-gray-600 max-w-md">
                  Chế độ demo - Hiển thị dữ liệu mẫu để minh họa chức năng theo dõi xe buýt
                </p>
              </div>

              {/* Mock map elements */}
              <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Xe buýt 01 - Đang hoạt động</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Trực tuyến</Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Trạm dừng - Trường THPT ABC</span>
                  </div>
                  <Badge variant="outline" className="text-xs">5 phút</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Tuyến đường chính</span>
                  </div>
                  <span className="text-xs text-gray-500">15.2 km</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-4 py-3 max-w-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Chế độ Demo</p>
                    <p className="text-blue-700 leading-relaxed">
                      Hiển thị dữ liệu mô phỏng. Để sử dụng bản đồ thực tế, cần Google Maps API key 
                      có kích hoạt thanh toán.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {markers.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Xe buýt hoạt động
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Trạm dừng
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                Trường học
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Sự cố
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`${className} ${isFullscreen ? "fixed inset-0 z-50" : ""}`}
    >
      <CardHeader
        className={`${isMobile ? "p-3" : "p-4"} ${isFullscreen ? "pb-2" : ""}`}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Bản đồ theo dõi
          </CardTitle>

          {showControls && (
            <div className="flex items-center gap-2">
              {showTraffic && (
                <Badge variant="outline" className="gap-1">
                  <Layers className="w-3 h-3" />
                  Giao thông
                </Badge>
              )}

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCenterMap}
                  className={isMobile ? "px-2" : ""}
                  disabled={!isLoaded}
                >
                  <RotateCcw className="w-4 h-4" />
                  {!isMobile && (
                    <span className="ml-1">Reset</span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className={isMobile ? "px-2" : ""}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                  {!isMobile && (
                    <span className="ml-1">
                      {isFullscreen
                        ? "Thu nhỏ"
                        : "Toàn màn hình"}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent
        className={`${isMobile ? "p-2" : "p-4"} ${isFullscreen ? "pt-0" : ""}`}
      >
        {isLoaded ? (
          <div
            ref={mapRef}
            className="w-full rounded-lg border"
            style={{ height: getMapHeight() }}
          />
        ) : (
          <div
            className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center border-2 border-dashed border-blue-200"
            style={{ height: getMapHeight() }}
          >
            <div className="flex flex-col items-center gap-4 p-6 text-center">
              <div className="relative">
                <MapPin className="w-16 h-16 text-blue-600 mb-2" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-800">
                  Bản đồ mô phỏng
                </p>
                <p className="text-sm text-gray-600 max-w-md">
                  Chế độ demo - Hiển thị dữ liệu mẫu để minh họa chức năng theo dõi xe buýt
                </p>
              </div>

              {/* Mock map elements */}
              <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Xe buýt 01 - Đang hoạt động</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Trực tuyến</Badge>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Trạm dừng - Trường THPT ABC</span>
                  </div>
                  <Badge variant="outline" className="text-xs">5 phút</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Tuyến đường chính</span>
                  </div>
                  <span className="text-xs text-gray-500">15.2 km</span>
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded px-4 py-3 max-w-md">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 mb-1">Chế độ Demo</p>
                    <p className="text-blue-700 leading-relaxed">
                      Hiển thị dữ liệu mô phỏng. Để sử dụng bản đồ thực tế, cần Google Maps API key 
                      có kích hoạt thanh toán.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {markers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Xe buýt hoạt động
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              Trạm dừng
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
              Trường học
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Sự cố
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook để sử dụng Google Maps API trong các component khác
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (window.google?.maps?.MapTypeId && window.google?.maps?.Map) {
      setIsLoaded(true);
      return;
    }

    const checkGoogleMaps = () => {
      if (window.google?.maps?.MapTypeId && window.google?.maps?.Map) {
        setIsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };

    checkGoogleMaps();
  }, []);

  return { isLoaded, googleMaps: window.google?.maps };
}