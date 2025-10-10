import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Maximize2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GpsData } from "@shared/schema";

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RouteMapProps {
  vehicleId: string | null;
}

export default function RouteMap({ vehicleId }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [routeLayer, setRouteLayer] = useState<L.LayerGroup | null>(null);

  const { data: gpsData, isLoading } = useQuery<GpsData[]>({
    queryKey: vehicleId ? [`/api/gps-data?vehicleId=${vehicleId}&limit=1000`] : ['/api/gps-data?limit=0'],
    enabled: !!vehicleId,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([-29.93, -51.22], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update route when GPS data changes
  useEffect(() => {
    if (!mapRef.current || !gpsData || gpsData.length === 0) {
      if (routeLayer) {
        routeLayer.clearLayers();
      }
      return;
    }

    // Clear existing route
    if (routeLayer) {
      routeLayer.clearLayers();
      mapRef.current.removeLayer(routeLayer);
    }

    const newRouteLayer = L.layerGroup();
    
    // Sort GPS data by timestamp
    const sortedData = [...gpsData].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    if (sortedData.length > 0) {
      // Create polyline from route data
      const routeCoordinates = sortedData.map(point => [point.latitude, point.longitude] as [number, number]);
      
      const routeLine = L.polyline(routeCoordinates, {
        color: '#1E6B7A',
        weight: 6,
        opacity: 1.0
      });

      newRouteLayer.addLayer(routeLine);

      // Add start marker (green)
      const startIcon = L.divIcon({
        className: 'custom-marker-start',
        iconSize: [20, 20],
        html: '<div style="width: 20px; height: 20px; background-color: #22c55e; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>'
      });

      const startPoint = sortedData[0];
      const startMarker = L.marker([startPoint.latitude, startPoint.longitude], { icon: startIcon })
        .bindPopup(`
          <div class="text-sm">
            <strong>Início da Rota</strong><br>
            Velocidade: ${startPoint.speed || 0} km/h<br>
            Hora: ${new Date(startPoint.timestamp).toLocaleTimeString('pt-BR')}<br>
            ${startPoint.ignition !== null ? `Ignição: ${startPoint.ignition ? 'Ligado' : 'Desligado'}` : ''}
          </div>
        `);

      newRouteLayer.addLayer(startMarker);

      // Add end marker (red) if there's more than one point
      if (sortedData.length > 1) {
        const endIcon = L.divIcon({
          className: 'custom-marker-end',
          iconSize: [20, 20],
          html: '<div style="width: 20px; height: 20px; background-color: #ef4444; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>'
        });

        const endPoint = sortedData[sortedData.length - 1];
        const endMarker = L.marker([endPoint.latitude, endPoint.longitude], { icon: endIcon })
          .bindPopup(`
            <div class="text-sm">
              <strong>Fim da Rota</strong><br>
              Velocidade: ${endPoint.speed || 0} km/h<br>
              Hora: ${new Date(endPoint.timestamp).toLocaleTimeString('pt-BR')}<br>
              ${endPoint.ignition !== null ? `Ignição: ${endPoint.ignition ? 'Ligado' : 'Desligado'}` : ''}
            </div>
          `);

        newRouteLayer.addLayer(endMarker);
      }

      // Add intermediate points for better visualization (every 10th point for performance)
      sortedData.forEach((point, index) => {
        if (index % 10 === 0 && index > 0 && index < sortedData.length - 1) {
          const intermediateIcon = L.divIcon({
            className: 'custom-marker-intermediate',
            iconSize: [10, 10],
            html: '<div style="width: 10px; height: 10px; background-color: #1E6B7A; border: 2px solid white; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>'
          });

          const intermediateMarker = L.marker([point.latitude, point.longitude], { icon: intermediateIcon })
            .bindPopup(`
              <div class="text-sm">
                <strong>Ponto Intermediário</strong><br>
                Velocidade: ${point.speed || 0} km/h<br>
                Hora: ${new Date(point.timestamp).toLocaleTimeString('pt-BR')}<br>
                Direção: ${point.direction ? `${point.direction.toFixed(1)}°` : 'N/A'}
              </div>
            `);

          newRouteLayer.addLayer(intermediateMarker);
        }
      });

      newRouteLayer.addTo(mapRef.current);
      setRouteLayer(newRouteLayer);

      // Fit map to route bounds
      const bounds = routeLine.getBounds();
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [gpsData]);

  const handleFullscreen = () => {
    if (mapContainerRef.current) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    }
  };

  const handleExportRoute = () => {
    if (!gpsData || gpsData.length === 0) return;

    const dataToExport = gpsData.map(point => ({
      timestamp: point.timestamp,
      latitude: point.latitude,
      longitude: point.longitude,
      speed: point.speed,
      direction: point.direction,
      ignition: point.ignition,
    }));

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `route_${vehicleId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Mapa de Rotas</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicleId 
              ? `Visualização interativa da rota do veículo selecionado` 
              : 'Selecione um veículo para visualizar a rota'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleFullscreen}
            data-testid="button-fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleExportRoute}
            disabled={!gpsData || gpsData.length === 0}
            data-testid="button-export-route"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={mapContainerRef} 
          className="w-full h-[600px]" 
          data-testid="map-container"
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-card/50 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-sm text-foreground">Carregando rota...</span>
            </div>
          </div>
        )}

        {!vehicleId && !isLoading && (
          <div className="absolute inset-0 bg-card/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Selecione um veículo para visualizar sua rota</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="px-6 py-4 border-t border-border bg-muted/20">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span className="text-muted-foreground">Início da Rota</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-destructive border-2 border-white shadow"></div>
            <span className="text-muted-foreground">Fim da Rota</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-1 bg-primary"></div>
            <span className="text-muted-foreground">Trajeto Percorrido</span>
          </div>
        </div>
      </div>
    </div>
  );
}
