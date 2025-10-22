// Map Components Export
export { MapContainer, useGoogleMaps } from './MapContainer';
export { LeafletMap } from './LeafletMap';
export { VehicleTracker, VehicleDetails } from './VehicleTracker';
export { RouteMap, RouteStats } from './RouteMap';

// Utility Types
export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  type: 'bus' | 'stop' | 'school' | 'home' | 'incident';
  icon?: string;
  info?: string;
  status?: 'active' | 'inactive' | 'warning' | 'danger';
}

export interface MapRoute {
  id: string;
  path: { lat: number; lng: number }[];
  color: string;
  strokeWeight?: number;
  title: string;
}

export interface Vehicle {
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

export interface BusStop {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  type: 'school' | 'regular' | 'home';
  studentsCount: number;
  arrivalTime: string;
  departureTime: string;
}

export interface RouteData {
  id: string;
  name: string;
  description: string;
  color: string;
  stops: BusStop[];
  path: { lat: number; lng: number }[];
  totalDistance: number;
  estimatedDuration: number;
  activeVehicles: number;
}