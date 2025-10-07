import { useState, useEffect } from "react";
import { Plus, Minus, Navigation, Clock, Battery, Gauge } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TrackingPoint {
  id: string;
  vehicleId: string;
  plate: string;
  latitude: number;
  longitude: number;
  speed: number;
  direction: number;
  date: string;
  ignition: string;
  odometer: number;
  mainBattery: string;
  backupBattery: string;
}

interface Vehicle {
  id: string;
  plate: string;
  deviceModel: string;
  deviceId: number;
}

interface VehicleMapViewProps {
  selectedVehicle?: Vehicle;
}

export function VehicleMapView({ selectedVehicle }: VehicleMapViewProps) {
  const [trackingData, setTrackingData] = useState<TrackingPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<TrackingPoint | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1156d058`;

  useEffect(() => {
    if (selectedVehicle) {
      fetchTrackingData();
    } else {
      setTrackingData([]);
      setSelectedPoint(null);
    }
  }, [selectedVehicle]);

  const fetchTrackingData = async () => {
    if (!selectedVehicle) return;

    setLoading(true);
    try {
      console.log('Fetching tracking data for vehicle:', selectedVehicle.id);
      const response = await fetch(`${apiUrl}/vehicles/${selectedVehicle.id}/tracking`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to fetch tracking data: ${response.status}`);
      }

      const data = await response.json();
      console.log('Tracking data received:', data);
      setTrackingData(data.trackingData || []);
      
      // Selecionar o ponto mais recente
      if (data.trackingData && data.trackingData.length > 0) {
        setSelectedPoint(data.trackingData[data.trackingData.length - 1]);
      }
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error(`Erro ao carregar dados de rastreamento: ${error.message}`);
      // Set empty array on error
      setTrackingData([]);
      setSelectedPoint(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateBounds = () => {
    if (trackingData.length === 0) return null;

    const lats = trackingData.map(p => p.latitude);
    const lngs = trackingData.map(p => p.longitude);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  };

  const bounds = calculateBounds();

  // Converter coordenadas geográficas para coordenadas SVG
  const coordinateToSvg = (lat: number, lng: number) => {
    if (!bounds) return { x: 0, y: 0 };
    
    const padding = 20;
    const width = 800 - 2 * padding;
    const height = 600 - 2 * padding;
    
    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = padding + (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    
    return { x, y };
  };

  const generatePath = () => {
    if (trackingData.length < 2) return '';
    
    const points = trackingData.map(point => coordinateToSvg(point.latitude, point.longitude));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const formatBattery = (battery: string) => {
    if (battery.includes('%')) return battery;
    return `${parseFloat(battery).toFixed(1)}V`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mapa de Rastreamento</span>
            {selectedVehicle && (
              <Badge variant="outline" className="gap-1">
                <Navigation className="w-3 h-3" />
                {selectedVehicle.plate}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-96 relative overflow-hidden">
            {!selectedVehicle ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Selecione um veículo para ver a rota</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Carregando dados de rastreamento...</p>
              </div>
            ) : trackingData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Navigation className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhum dado de rastreamento encontrado</p>
                  <p className="text-sm text-gray-400">Faça upload de dados JSON para ver a rota</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mapa com rota */}
                <svg className="w-full h-full" viewBox="0 0 800 600">
                  {/* Fundo do mapa */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="800" height="600" fill="url(#grid)" />
                  
                  {/* Rota */}
                  <path 
                    d={generatePath()}
                    stroke="#3b82f6" 
                    strokeWidth="3" 
                    fill="none"
                    strokeDasharray="8,4"
                  />
                  
                  {/* Pontos de rastreamento */}
                  {trackingData.map((point, index) => {
                    const { x, y } = coordinateToSvg(point.latitude, point.longitude);
                    const isFirst = index === 0;
                    const isLast = index === trackingData.length - 1;
                    const isSelected = selectedPoint?.id === point.id;
                    
                    return (
                      <g key={point.id}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r={isSelected ? 8 : isFirst || isLast ? 6 : 4}
                          fill={isFirst ? "#22c55e" : isLast ? "#ef4444" : "#3b82f6"}
                          stroke="white"
                          strokeWidth="2"
                          className="cursor-pointer hover:r-6 transition-all"
                          onClick={() => setSelectedPoint(point)}
                        />
                        {(isFirst || isLast) && (
                          <text 
                            x={x} 
                            y={y - 15} 
                            textAnchor="middle" 
                            className="text-xs font-medium fill-gray-700"
                          >
                            {isFirst ? 'Início' : 'Fim'}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                
                {/* Controles do mapa */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button variant="outline" size="icon" className="bg-white shadow-sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white shadow-sm">
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Informações do ponto selecionado */}
                {selectedPoint && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{formatDate(selectedPoint.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <span>{selectedPoint.speed} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-500" />
                        <span>{selectedPoint.direction.toFixed(1)}°</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Battery className="w-4 h-4 text-gray-500" />
                        <span>{formatBattery(selectedPoint.mainBattery)}</span>
                      </div>
                      <div className="col-span-2">
                        <Badge variant={selectedPoint.ignition === 'ON' ? 'default' : 'secondary'}>
                          {selectedPoint.ignition === 'ON' ? 'Ligado' : 'Desligado'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas da rota */}
      {trackingData.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Total de Pontos</div>
              <div className="text-2xl font-semibold">{trackingData.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Velocidade Máxima</div>
              <div className="text-2xl font-semibold">
                {Math.max(...trackingData.map(p => p.speed))} km/h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Velocidade Média</div>
              <div className="text-2xl font-semibold">
                {(trackingData.reduce((sum, p) => sum + p.speed, 0) / trackingData.length).toFixed(1)} km/h
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Duração</div>
              <div className="text-2xl font-semibold">
                {trackingData.length > 1 ? 
                  Math.round((new Date(trackingData[trackingData.length - 1].date).getTime() - 
                            new Date(trackingData[0].date).getTime()) / 60000) + 'min' : 
                  '0min'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}