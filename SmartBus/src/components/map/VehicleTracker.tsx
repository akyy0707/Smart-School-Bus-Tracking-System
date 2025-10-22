import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LeafletMap } from './LeafletMap';
import { useIsMobile } from '../ui/use-mobile';
import { 
  Bus, 
  Navigation, 
  Clock, 
  Users, 
  MapPin, 
  AlertCircle,
  CheckCircle,
  Zap,
  Fuel,
  Thermometer
} from 'lucide-react';

interface Vehicle {
  id: string;
  licensePlate: string;
  driverName: string;
  route: string;
  position: { lat: number; lng: number };
  speed: number;
  status: 'active' | 'stopped' | 'maintenance' | 'incident';
  lastUpdate: string;
  studentsOnBoard: number;
  totalCapacity: number;
  fuel: number;
  temperature: number;
  nextStop: string;
  estimatedArrival: string;
}

interface VehicleTrackerProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleSelect?: (vehicleId: string) => void;
  showRoutes?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function VehicleTracker({
  vehicles,
  selectedVehicleId,
  onVehicleSelect,
  showRoutes = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 giây
}: VehicleTrackerProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const isMobile = useIsMobile();

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      setSelectedVehicle(vehicle || null);
    }
  }, [selectedVehicleId, vehicles]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Ở đây sẽ gọi API để refresh dữ liệu
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle.id);
    }
  };

  const getVehicleMarkers = () => {
    return vehicles.map(vehicle => ({
      id: vehicle.id,
      position: vehicle.position,
      title: `${vehicle.licensePlate} - ${vehicle.driverName}`,
      type: 'bus' as const,
      status: vehicle.status === 'active' ? 'active' as const : 
              vehicle.status === 'incident' ? 'danger' as const : 
              'warning' as const,
      info: `
        <div class="min-w-[200px]">
          <div class="font-medium text-lg mb-2">${vehicle.licensePlate}</div>
          <div class="space-y-1 text-sm">
            <div><strong>Tài xế:</strong> ${vehicle.driverName}</div>
            <div><strong>Tuyến:</strong> ${vehicle.route}</div>
            <div><strong>Tốc độ:</strong> ${vehicle.speed} km/h</div>
            <div><strong>Học sinh:</strong> ${vehicle.studentsOnBoard}/${vehicle.totalCapacity}</div>
            <div><strong>Trạm tiếp theo:</strong> ${vehicle.nextStop}</div>
          </div>
        </div>
      `
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'incident': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'stopped': return <Clock className="w-4 h-4" />;
      case 'maintenance': return <Zap className="w-4 h-4" />;
      case 'incident': return <AlertCircle className="w-4 h-4" />;
      default: return <Bus className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'stopped': return 'Đang dừng';
      case 'maintenance': return 'Bảo trì';
      case 'incident': return 'Sự cố';
      default: return 'Không xác định';
    }
  };

  const mapCenter = selectedVehicle 
    ? selectedVehicle.position 
    : vehicles.length > 0 
      ? vehicles[0].position 
      : { lat: 10.8231, lng: 106.6297 };

  return (
    <div className={`grid ${isMobile ? 'grid-rows-[auto_1fr]' : 'grid-cols-[350px_1fr]'} gap-4 h-full`}>
      {/* Vehicle List */}
      <Card className={`${isMobile ? 'order-2' : ''}`}>
        <CardHeader className={isMobile ? 'p-3' : ''}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Danh sách xe
            </div>
            <Badge variant="outline">
              {vehicles.length} xe
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className={`${isMobile ? 'p-2' : ''} space-y-3 max-h-[400px] overflow-y-auto`}>
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedVehicle?.id === vehicle.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleVehicleSelect(vehicle)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{vehicle.licensePlate}</div>
                  <Badge className={getStatusColor(vehicle.status)}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1">{getStatusText(vehicle.status)}</span>
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  {vehicle.speed} km/h
                </div>
              </div>
              
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3 h-3" />
                  {vehicle.route}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {vehicle.studentsOnBoard}/{vehicle.totalCapacity} học sinh
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  Tiếp theo: {vehicle.nextStop}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Dự kiến: {vehicle.estimatedArrival}
                </div>
              </div>
              
              {/* Thông tin chi tiết */}
              <div className="mt-2 pt-2 border-t flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3 h-3" />
                    {vehicle.fuel}%
                  </div>
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-3 h-3" />
                    {vehicle.temperature}°C
                  </div>
                </div>
                <div>
                  Cập nhật: {vehicle.lastUpdate}
                </div>
              </div>
            </div>
          ))}
          
          {vehicles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Không có xe nào đang hoạt động</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map */}
      <div className={`${isMobile ? 'order-1' : ''}`}>
        <LeafletMap
          height={isMobile ? '300px' : '600px'}
          center={mapCenter}
          zoom={selectedVehicle ? 15 : 12}
          markers={getVehicleMarkers()}
          showTraffic={true}
          showControls={true}
        />
      </div>
    </div>
  );
}

// Component hiển thị thông tin chi tiết xe được chọn
export function VehicleDetails({ vehicle }: { vehicle: Vehicle }) {
  const isMobile = useIsMobile();
  
  return (
    <Card>
      <CardHeader className={isMobile ? 'p-3' : ''}>
        <CardTitle className="flex items-center gap-2">
          <Bus className="w-5 h-5" />
          Chi tiết xe {vehicle.licensePlate}
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-3' : ''} space-y-4`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Tài xế</label>
            <p className="font-medium">{vehicle.driverName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tuyến đường</label>
            <p className="font-medium">{vehicle.route}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tốc độ hiện tại</label>
            <p className="font-medium">{vehicle.speed} km/h</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Trạng thái</label>
            <Badge className={getStatusColor(vehicle.status)}>
              {getStatusText(vehicle.status)}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6 mx-auto mb-1" />
            <div className="font-medium">{vehicle.studentsOnBoard}</div>
            <div className="text-xs text-gray-600">Học sinh</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Fuel className="w-6 h-6 mx-auto mb-1" />
            <div className="font-medium">{vehicle.fuel}%</div>
            <div className="text-xs text-gray-600">Nhiên liệu</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Thermometer className="w-6 h-6 mx-auto mb-1" />
            <div className="font-medium">{vehicle.temperature}°C</div>
            <div className="text-xs text-gray-600">Nhiệt độ</div>
          </div>
        </div>
        
        <div>
          <label className="text-sm text-gray-600">Trạm tiếp theo</label>
          <p className="font-medium">{vehicle.nextStop}</p>
          <p className="text-sm text-gray-500">Dự kiến đến: {vehicle.estimatedArrival}</p>
        </div>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Cập nhật lần cuối: {vehicle.lastUpdate}
        </div>
      </CardContent>
    </Card>
  );

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'incident': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'stopped': return 'Đang dừng';
      case 'maintenance': return 'Bảo trì';
      case 'incident': return 'Sự cố';
      default: return 'Không xác định';
    }
  }
}