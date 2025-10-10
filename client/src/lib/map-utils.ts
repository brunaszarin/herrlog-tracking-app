import L from "leaflet";

// Utility functions for map operations and GPS data processing

export interface RoutePoint {
  lat: number;
  lng: number;
  speed?: number;
  timestamp: string | Date;
  direction?: number;
  ignition?: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Create custom marker icons for start and end points
 */
export const createCustomMarkers = () => {
  const startIcon = L.divIcon({
    className: 'custom-marker-start',
    iconSize: [16, 16],
    html: '',
    iconAnchor: [8, 8],
  });

  const endIcon = L.divIcon({
    className: 'custom-marker-end',
    iconSize: [16, 16], 
    html: '',
    iconAnchor: [8, 8],
  });

  const intermediateIcon = L.divIcon({
    className: 'w-2 h-2 bg-primary rounded-full border border-white',
    iconSize: [8, 8],
    html: '',
    iconAnchor: [4, 4],
  });

  return { startIcon, endIcon, intermediateIcon };
};

/**
 * Calculate the distance between two GPS points using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point  
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate total route distance from array of GPS points
 * @param points Array of route points
 * @returns Total distance in kilometers
 */
export const calculateRouteDistance = (points: RoutePoint[]): number => {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    totalDistance += calculateDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  
  return totalDistance;
};

/**
 * Calculate average speed for a route
 * @param points Array of route points with timestamps
 * @returns Average speed in km/h
 */
export const calculateAverageSpeed = (points: RoutePoint[]): number => {
  if (points.length < 2) return 0;
  
  const validSpeeds = points.filter(p => p.speed !== undefined && p.speed !== null).map(p => p.speed!);
  if (validSpeeds.length === 0) return 0;
  
  const totalSpeed = validSpeeds.reduce((sum, speed) => sum + speed, 0);
  return totalSpeed / validSpeeds.length;
};

/**
 * Calculate route duration in minutes
 * @param points Array of route points with timestamps
 * @returns Duration in minutes
 */
export const calculateRouteDuration = (points: RoutePoint[]): number => {
  if (points.length < 2) return 0;
  
  const startTime = new Date(points[0].timestamp);
  const endTime = new Date(points[points.length - 1].timestamp);
  
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60); // Convert to minutes
};

/**
 * Format duration in minutes to human readable format
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

/**
 * Get bounds for an array of GPS points
 * @param points Array of route points
 * @returns Map bounds object
 */
export const getRouteBounds = (points: RoutePoint[]): MapBounds | null => {
  if (points.length === 0) return null;
  
  let north = points[0].lat;
  let south = points[0].lat;
  let east = points[0].lng;
  let west = points[0].lng;
  
  points.forEach(point => {
    north = Math.max(north, point.lat);
    south = Math.min(south, point.lat);
    east = Math.max(east, point.lng);
    west = Math.min(west, point.lng);
  });
  
  return { north, south, east, west };
};

/**
 * Create popup content for GPS points
 * @param point GPS point data
 * @param type Type of point (start, end, intermediate)
 * @returns HTML string for popup
 */
export const createPopupContent = (point: RoutePoint, type: 'start' | 'end' | 'intermediate'): string => {
  const timestamp = new Date(point.timestamp);
  const timeString = timestamp.toLocaleTimeString('pt-BR');
  const dateString = timestamp.toLocaleDateString('pt-BR');
  
  let title = '';
  switch (type) {
    case 'start':
      title = 'Início da Rota';
      break;
    case 'end':
      title = 'Fim da Rota';
      break;
    case 'intermediate':
      title = 'Ponto Intermediário';
      break;
  }
  
  return `
    <div class="text-sm">
      <strong>${title}</strong><br>
      <strong>Data:</strong> ${dateString}<br>
      <strong>Hora:</strong> ${timeString}<br>
      ${point.speed !== undefined ? `<strong>Velocidade:</strong> ${Math.round(point.speed)} km/h<br>` : ''}
      ${point.direction !== undefined ? `<strong>Direção:</strong> ${point.direction.toFixed(1)}°<br>` : ''}
      ${point.ignition !== undefined ? `<strong>Ignição:</strong> ${point.ignition ? 'Ligado' : 'Desligado'}<br>` : ''}
      <strong>Coordenadas:</strong> ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}
    </div>
  `;
};

/**
 * Filter GPS points to reduce density for better performance
 * @param points Array of GPS points
 * @param maxPoints Maximum number of points to return
 * @returns Filtered array of points
 */
export const filterPointsForDisplay = (points: RoutePoint[], maxPoints: number = 200): RoutePoint[] => {
  if (points.length <= maxPoints) return points;
  
  const step = Math.ceil(points.length / maxPoints);
  const filteredPoints: RoutePoint[] = [];
  
  // Always include first point
  filteredPoints.push(points[0]);
  
  // Add intermediate points
  for (let i = step; i < points.length - 1; i += step) {
    filteredPoints.push(points[i]);
  }
  
  // Always include last point
  if (points.length > 1) {
    filteredPoints.push(points[points.length - 1]);
  }
  
  return filteredPoints;
};

/**
 * Validate GPS coordinates
 * @param lat Latitude
 * @param lng Longitude
 * @returns True if coordinates are valid
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Convert direction angle to compass direction
 * @param degrees Direction in degrees (0-360)
 * @returns Compass direction string
 */
export const degreesToCompass = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};

/**
 * Create route statistics object
 * @param points Array of GPS points
 * @returns Route statistics
 */
export const calculateRouteStats = (points: RoutePoint[]) => {
  if (points.length === 0) {
    return {
      totalDistance: 0,
      averageSpeed: 0,
      maxSpeed: 0,
      duration: 0,
      pointCount: 0,
    };
  }
  
  const totalDistance = calculateRouteDistance(points);
  const averageSpeed = calculateAverageSpeed(points);
  const duration = calculateRouteDuration(points);
  
  const speeds = points.filter(p => p.speed !== undefined && p.speed !== null).map(p => p.speed!);
  const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  
  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
    averageSpeed: Math.round(averageSpeed),
    maxSpeed: Math.round(maxSpeed),
    duration,
    pointCount: points.length,
  };
};

/**
 * Default map configuration for Brazil
 */
export const DEFAULT_MAP_CONFIG = {
  center: [-15.7801, -47.9292] as [number, number], // Brasília coordinates
  zoom: 4,
  maxZoom: 19,
  minZoom: 3,
};

/**
 * Route line style configuration
 */
export const ROUTE_STYLE = {
  color: '#005F73', // Herrlog primary color
  weight: 4,
  opacity: 0.8,
  smoothFactor: 1,
};
