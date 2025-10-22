import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { LeafletMap } from '../map/LeafletMap';
import { useNotificationHelpers } from '../useNotificationHelpers';
import { 
  Route, 
  Search, 
  Plus, 
  Edit, 
  MapPin, 
  Navigation,
  Clock,
  Users,
  Trash2,
  Eye,
  Map
} from 'lucide-react';

interface RouteStop {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  order: number;
  estimatedTime: string;
}

interface RouteData {
  id: string;
  name: string;
  description: string;
  startPoint: string;
  endPoint: string;
  totalDistance: number;
  estimatedTime: number;
  stops: number;
  activeVehicles: number;
  students: number;
  status: string;
  stopDetails?: RouteStop[];
}

export function ManagerRoutes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteData | null>(null);
  const [newRoute, setNewRoute] = useState({
    name: '',
    description: '',
    startPoint: '',
    endPoint: '',
    totalDistance: 0,
    estimatedTime: 0,
    stops: 0
  });
  const { showSuccess, showInfo, showError } = useNotificationHelpers();

  const [routes, setRoutes] = useState<RouteData[]>([
    {
      id: 'R001',
      name: 'Tuyến 1',
      description: 'Bến xe Miền Đông - Trường THPT Nguyễn Du',
      startPoint: 'Bến xe Miền Đông',
      endPoint: 'Trường THPT Nguyễn Du',
      totalDistance: 25.5,
      estimatedTime: 45,
      stops: 8,
      activeVehicles: 2,
      students: 85,
      status: 'active',
      stopDetails: [
        { id: 'S1', name: 'Bến xe Miền Đông', position: { lat: 10.8231, lng: 106.6297 }, order: 1, estimatedTime: '07:00' },
        { id: 'S2', name: 'Khu đô thị Vinhomes', position: { lat: 10.8280, lng: 106.6350 }, order: 2, estimatedTime: '07:10' },
        { id: 'S3', name: 'Chợ Bến Thành', position: { lat: 10.8330, lng: 106.6400 }, order: 3, estimatedTime: '07:20' },
        { id: 'S4', name: 'Trường THPT Lê Quý Đôn', position: { lat: 10.8380, lng: 106.6450 }, order: 4, estimatedTime: '07:30' }
      ]
    },
    {
      id: 'R002',
      name: 'Tuyến 2',
      description: 'Bến xe An Sương - Trường THCS Lê Quý Đôn',
      startPoint: 'Bến xe An Sương',
      endPoint: 'Trường THCS Lê Quý Đôn',
      totalDistance: 18.2,
      estimatedTime: 35,
      stops: 6,
      activeVehicles: 1,
      students: 42,
      status: 'active',
      stopDetails: [
        { id: 'S5', name: 'Bến xe An Sương', position: { lat: 10.8450, lng: 106.6200 }, order: 1, estimatedTime: '07:00' },
        { id: 'S6', name: 'Khu Tân Bình', position: { lat: 10.8500, lng: 106.6250 }, order: 2, estimatedTime: '07:10' },
        { id: 'S7', name: 'Trường THCS Lê Quý Đôn', position: { lat: 10.8550, lng: 106.6300 }, order: 3, estimatedTime: '07:20' }
      ]
    },
    {
      id: 'R003',
      name: 'Tuyến 3',
      description: 'Chợ Bình Tây - Trường THPT Marie Curie',
      startPoint: 'Chợ Bình Tây',
      endPoint: 'Trường THPT Marie Curie',
      totalDistance: 32.1,
      estimatedTime: 55,
      stops: 12,
      activeVehicles: 1,
      students: 67,
      status: 'active',
      stopDetails: [
        { id: 'S8', name: 'Chợ Bình Tây', position: { lat: 10.8100, lng: 106.6550 }, order: 1, estimatedTime: '07:00' },
        { id: 'S9', name: 'Bệnh viện Chợ Rẫy', position: { lat: 10.8150, lng: 106.6600 }, order: 2, estimatedTime: '07:15' },
        { id: 'S10', name: 'Công viên Tao Đàn', position: { lat: 10.8200, lng: 106.6650 }, order: 3, estimatedTime: '07:30' },
        { id: 'S11', name: 'Trường THPT Marie Curie', position: { lat: 10.8250, lng: 106.6700 }, order: 4, estimatedTime: '07:45' }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Tạm dừng</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoute = () => {
    setNewRoute({
      name: '',
      description: '',
      startPoint: '',
      endPoint: '',
      totalDistance: 0,
      estimatedTime: 0,
      stops: 0
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveNewRoute = () => {
    if (!newRoute.name || !newRoute.startPoint || !newRoute.endPoint) {
      showError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const existingRoute = routes.find(r => r.name.toLowerCase() === newRoute.name.toLowerCase());
    if (existingRoute) {
      showError('Tên tuyến đường đã tồn tại trong hệ thống');
      return;
    }

    const routeData: RouteData = {
      ...newRoute,
      id: `R${String(routes.length + 1).padStart(3, '0')}`,
      status: 'active',
      activeVehicles: 0,
      students: 0,
      stopDetails: []
    };

    setRoutes([...routes, routeData]);
    showSuccess(`Đã tạo tuyến đường ${newRoute.name} thành công`);
    setIsAddDialogOpen(false);
  };

  const handleEditRoute = (route: RouteData) => {
    setSelectedRoute(route);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRoute = () => {
    if (!selectedRoute) return;

    setRoutes(routes.map(r => 
      r.id === selectedRoute.id ? selectedRoute : r
    ));

    showSuccess('Cập nhật thành công', `Tuyến đường ${selectedRoute?.name} đã được cập nhật!`);
    setIsEditDialogOpen(false);
    setSelectedRoute(null);
  };

  const handleViewDetails = (route: RouteData) => {
    setSelectedRoute(route);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteRoute = (route: RouteData) => {
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteRoute = () => {
    if (!selectedRoute) return;

    if (selectedRoute.activeVehicles > 0) {
      showError('Không thể xóa tuyến đường đang có xe hoạt động');
      setIsDeleteDialogOpen(false);
      return;
    }

    setRoutes(routes.filter(r => r.id !== selectedRoute.id));
    showInfo(`Đã xóa tuyến đường ${selectedRoute.name}`);
    setIsDeleteDialogOpen(false);
    setSelectedRoute(null);
  };

  const getRouteMapData = (route: RouteData | null) => {
    if (!route || !route.stopDetails || route.stopDetails.length === 0) {
      return { markers: [], routes: [] };
    }

    const markers = route.stopDetails.map((stop, index) => ({
      id: stop.id,
      position: stop.position,
      title: stop.name,
      type: (index === 0 ? 'school' : index === route.stopDetails!.length - 1 ? 'school' : 'stop') as 'bus' | 'stop' | 'school' | 'home' | 'incident',
      info: `${stop.name} - ${stop.estimatedTime}`
    }));

    const routePath = route.stopDetails.map(stop => stop.position);

    return {
      markers,
      routes: [{
        id: route.id,
        title: route.name,
        color: '#3b82f6',
        path: routePath
      }]
    };
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Route className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng tuyến</p>
                <p className="font-semibold">{routes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                <p className="font-semibold">{routes.filter(r => r.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Navigation className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng km</p>
                <p className="font-semibold">{routes.reduce((sum, r) => sum + r.totalDistance, 0).toFixed(1)} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                <p className="font-semibold">{routes.reduce((sum, r) => sum + r.students, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Quản lý Tuyến đường
            </CardTitle>
            
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddRoute}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo tuyến mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên tuyến, điểm đầu/cuối..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tuyến đường</TableHead>
                <TableHead>Điểm đầu/cuối</TableHead>
                <TableHead>Khoảng cách</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Điểm dừng</TableHead>
                <TableHead>Xe hoạt động</TableHead>
                <TableHead>Học sinh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4" />
                        <span className="font-medium">{route.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {route.description}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-green-600" />
                        <span>{route.startPoint}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-red-600" />
                        <span>{route.endPoint}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      <span className="font-medium">{route.totalDistance} km</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{route.estimatedTime} phút</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {route.stops} điểm
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800">
                      {route.activeVehicles} xe
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{route.students} HS</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {getStatusBadge(route.status)}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(route)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRoute(route)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteRoute(route)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Route Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo tuyến đường mới</DialogTitle>
            <DialogDescription>
              Nhập đầy đủ thông tin để tạo tuyến đường mới trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Tên tuyến <span className="text-red-500">*</span></Label>
              <Input
                id="new-name"
                placeholder="Tuyến 4"
                value={newRoute.name}
                onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-description">Mô tả</Label>
              <Textarea
                id="new-description"
                placeholder="Mô tả chi tiết về tuyến đường..."
                value={newRoute.description}
                onChange={(e) => setNewRoute({...newRoute, description: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-start">Điểm xuất phát <span className="text-red-500">*</span></Label>
                <Input
                  id="new-start"
                  placeholder="Bến xe..."
                  value={newRoute.startPoint}
                  onChange={(e) => setNewRoute({...newRoute, startPoint: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-end">Điểm đích <span className="text-red-500">*</span></Label>
                <Input
                  id="new-end"
                  placeholder="Trường..."
                  value={newRoute.endPoint}
                  onChange={(e) => setNewRoute({...newRoute, endPoint: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-distance">Khoảng cách (km)</Label>
                <Input
                  id="new-distance"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={newRoute.totalDistance || ''}
                  onChange={(e) => setNewRoute({...newRoute, totalDistance: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-time">Thời gian (phút)</Label>
                <Input
                  id="new-time"
                  type="number"
                  placeholder="0"
                  value={newRoute.estimatedTime || ''}
                  onChange={(e) => setNewRoute({...newRoute, estimatedTime: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-stops">Số điểm dừng</Label>
                <Input
                  id="new-stops"
                  type="number"
                  placeholder="0"
                  value={newRoute.stops || ''}
                  onChange={(e) => setNewRoute({...newRoute, stops: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveNewRoute} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Tạo tuyến
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tuyến đường: {selectedRoute?.name}</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin và cấu hình tuyến đường.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên tuyến</Label>
                <Input
                  id="edit-name"
                  value={selectedRoute.name}
                  onChange={(e) => setSelectedRoute({...selectedRoute, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={selectedRoute.description}
                  onChange={(e) => setSelectedRoute({...selectedRoute, description: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-start">Điểm xuất phát</Label>
                  <Input
                    id="edit-start"
                    value={selectedRoute.startPoint}
                    onChange={(e) => setSelectedRoute({...selectedRoute, startPoint: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end">Điểm đích</Label>
                  <Input
                    id="edit-end"
                    value={selectedRoute.endPoint}
                    onChange={(e) => setSelectedRoute({...selectedRoute, endPoint: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-distance">Khoảng cách (km)</Label>
                  <Input
                    id="edit-distance"
                    type="number"
                    step="0.1"
                    value={selectedRoute.totalDistance}
                    onChange={(e) => setSelectedRoute({...selectedRoute, totalDistance: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Thời gian (phút)</Label>
                  <Input
                    id="edit-time"
                    type="number"
                    value={selectedRoute.estimatedTime}
                    onChange={(e) => setSelectedRoute({...selectedRoute, estimatedTime: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select 
                    value={selectedRoute.status}
                    onValueChange={(value) => setSelectedRoute({...selectedRoute, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Tạm dừng</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedRoute.stopDetails && selectedRoute.stopDetails.length > 0 && (
                <div className="space-y-2">
                  <Label>Xem trên bản đồ</Label>
                  <LeafletMap
                    height="300px"
                    center={selectedRoute.stopDetails[0]?.position || { lat: 10.8231, lng: 106.6297 }}
                    zoom={13}
                    markers={getRouteMapData(selectedRoute).markers}
                    routes={getRouteMapData(selectedRoute).routes}
                    showControls={true}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdateRoute} className="bg-blue-600 hover:bg-blue-700">
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết tuyến đường: {selectedRoute?.name}</DialogTitle>
            <DialogDescription>
              Thông tin đầy đủ về tuyến đường và các điểm dừng.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-muted-foreground">Tên tuyến</Label>
                    <p className="mt-1 font-medium">{selectedRoute.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Mô tả</Label>
                    <p className="mt-1">{selectedRoute.description}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Điểm xuất phát</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{selectedRoute.startPoint}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Điểm đích</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{selectedRoute.endPoint}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Khoảng cách</Label>
                      <p className="mt-1 font-medium">{selectedRoute.totalDistance} km</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Thời gian</Label>
                      <p className="mt-1 font-medium">{selectedRoute.estimatedTime} phút</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Điểm dừng</Label>
                      <p className="mt-1 font-medium">{selectedRoute.stops} điểm</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Xe hoạt động</Label>
                      <p className="mt-1 font-medium">{selectedRoute.activeVehicles} xe</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Học sinh</Label>
                      <p className="mt-1 font-medium">{selectedRoute.students} HS</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Trạng thái</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedRoute.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              {selectedRoute.stopDetails && selectedRoute.stopDetails.length > 0 && (
                <div className="space-y-2">
                  <Label>Bản đồ tuyến đường</Label>
                  <LeafletMap
                    height="400px"
                    center={selectedRoute.stopDetails[0]?.position || { lat: 10.8231, lng: 106.6297 }}
                    zoom={13}
                    markers={getRouteMapData(selectedRoute).markers}
                    routes={getRouteMapData(selectedRoute).routes}
                    showControls={true}
                  />
                </div>
              )}

              {/* Stop Details */}
              {selectedRoute.stopDetails && selectedRoute.stopDetails.length > 0 && (
                <div className="space-y-2">
                  <Label>Các điểm dừng</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Thứ tự</TableHead>
                          <TableHead>Tên điểm dừng</TableHead>
                          <TableHead>Thời gian dự kiến</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedRoute.stopDetails.map((stop) => (
                          <TableRow key={stop.id}>
                            <TableCell>
                              <Badge variant="outline">{stop.order}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">{stop.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{stop.estimatedTime}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
            <Button 
              onClick={() => {
                setIsDetailDialogOpen(false);
                if (selectedRoute) {
                  handleEditRoute(selectedRoute);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tuyến đường</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tuyến đường <span className="font-semibold">{selectedRoute?.name}</span>? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRoute}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa tuyến
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
