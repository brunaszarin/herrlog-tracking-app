import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Clock, Gauge, Battery, Play, Pause, RotateCcw, Settings, Key } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

// Declare TomTom types
declare global {
  interface Window {
    tt: any;
  }
}

interface TrackingPoint {
  plate: string;
  deviceModel: string;
  deviceId: number;
  positionId: number;
  date: string;
  latitude: number;
  longitude: number;
  speed: number;
  ignition: "ON" | "OFF";
  batteryPercentual: string;
  direction?: number;
}

interface MapRouteViewerProps {
  vehicles: string[];
  trackingData: Record<string, TrackingPoint[]>;
}

export function MapRouteViewer({ vehicles, trackingData }: MapRouteViewerProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [selectedPoint, setSelectedPoint] = useState<TrackingPoint | null>(null);
  const [animationPlaying, setAnimationPlaying] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tomtomApiKey, setTomtomApiKey] = useState<string>("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [tomtomLoadFailed, setTomtomLoadFailed] = useState(false);
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);

  const currentTrackingData = selectedVehicle 
    ? (trackingData[selectedVehicle] || []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    : [];

  // Debug logs
  console.log('MapRouteViewer - Debug Info:', {
    vehiclesCount: vehicles.length,
    vehiclesList: vehicles,
    trackingDataKeys: Object.keys(trackingData),
    selectedVehicle,
    currentTrackingDataCount: currentTrackingData.length,
    trackingDataSample: Object.entries(trackingData).map(([key, data]) => ({
      vehicle: key,
      points: data.length,
      firstPoint: data[0] ? { lat: data[0].latitude, lng: data[0].longitude, date: data[0].date } : null
    }))
  });

  // Load TomTom API key
  useEffect(() => {
    // For demo purposes, we'll use a placeholder key
    // In production, this should be loaded from your environment configuration
    const demoKey = 'demo-key-replace-with-your-tomtom-api-key';
    setTomtomApiKey(demoKey);
  }, []);

  // Load TomTom Maps SDK
  useEffect(() => {
    if (!tomtomApiKey || mapLoaded || tomtomLoadFailed) return;

    const loadTomTomSDK = () => {
      // Check if TomTom resources are already loaded
      const existingCss = document.querySelector('link[href*="tomtom.com"]');
      const existingScript = document.querySelector('script[src*="tomtom.com"]');
      
      if (existingCss && existingScript && window.tt) {
        setMapLoaded(true);
        return;
      }

      // Suppress CSS security errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('cssRules') || message.includes('CSSStyleSheet')) {
          return; // Suppress CSS-related security errors
        }
        originalConsoleError.apply(console, args);
      };

      let cssLoaded = false;
      let scriptLoaded = false;
      let loadingFailed = false;

      const checkLoadingComplete = () => {
        if (loadingFailed) return;
        
        if (cssLoaded && scriptLoaded && window.tt) {
          setMapLoaded(true);
          console.error = originalConsoleError;
        } else if (cssLoaded && scriptLoaded && !window.tt) {
          // Script loaded but TomTom object not available
          setTomtomLoadFailed(true);
          console.warn('TomTom Maps API not available, using SVG fallback');
          console.error = originalConsoleError;
        }
      };

      const handleLoadFailure = (reason: string) => {
        if (loadingFailed) return;
        loadingFailed = true;
        setTomtomLoadFailed(true);
        console.warn(`TomTom loading failed (${reason}), using SVG fallback`);
        console.error = originalConsoleError;
      };

      // Load CSS with timeout
      if (!existingCss) {
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps.css';
        css.onload = () => {
          cssLoaded = true;
          checkLoadingComplete();
        };
        css.onerror = () => handleLoadFailure('CSS loading failed');
        document.head.appendChild(css);

        // CSS loading timeout
        setTimeout(() => {
          if (!cssLoaded && !loadingFailed) {
            handleLoadFailure('CSS loading timeout');
          }
        }, 5000);
      } else {
        cssLoaded = true;
      }

      // Load JS with timeout
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.25.0/maps/maps-web.min.js';
        script.onload = () => {
          scriptLoaded = true;
          setTimeout(checkLoadingComplete, 100); // Small delay to ensure window.tt is available
        };
        script.onerror = () => handleLoadFailure('Script loading failed');
        document.head.appendChild(script);

        // Script loading timeout
        setTimeout(() => {
          if (!scriptLoaded && !loadingFailed) {
            handleLoadFailure('Script loading timeout');
          }
        }, 10000);
      } else {
        scriptLoaded = true;
        setTimeout(checkLoadingComplete, 100);
      }
    };

    loadTomTomSDK();
  }, [tomtomApiKey, mapLoaded, tomtomLoadFailed]);

  // Initialize map when loaded and vehicle selected
  useEffect(() => {
    if (!mapLoaded || !selectedVehicle || !currentTrackingData.length || !window.tt || !tomtomApiKey || tomtomApiKey === 'demo-key-replace-with-your-tomtom-api-key' || tomtomLoadFailed) {
      return; // Fall back to SVG visualization
    }

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    try {
      // Calculate center point
      const centerLat = currentTrackingData.reduce((sum, p) => sum + p.latitude, 0) / currentTrackingData.length;
      const centerLng = currentTrackingData.reduce((sum, p) => sum + p.longitude, 0) / currentTrackingData.length;

      // Suppress CSS errors during map initialization
      const originalWarn = console.warn;
      const originalError = console.error;
      console.warn = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('cssRules') || message.includes('CSSStyleSheet') || message.includes('SecurityError')) {
          return;
        }
        originalWarn.apply(console, args);
      };
      console.error = (...args) => {
        const message = args[0]?.toString() || '';
        if (message.includes('cssRules') || message.includes('CSSStyleSheet') || message.includes('SecurityError')) {
          return;
        }
        originalError.apply(console, args);
      };

      // Initialize map
      const map = window.tt.map({
        key: tomtomApiKey,
        container: 'tomtom-map',
        center: [centerLng, centerLat],
        zoom: 12,
        style: 'tomtom://vector/1/basic-main'
      });

      mapRef.current = map;

      map.on('load', () => {
        try {
          renderRoute();
          renderMarkers();
          fitMapToRoute();
        } catch (error) {
          console.warn('Map rendering failed:', error);
        } finally {
          // Restore console methods
          console.warn = originalWarn;
          console.error = originalError;
        }
      });

      // Restore console methods after timeout
      setTimeout(() => {
        console.warn = originalWarn;
        console.error = originalError;
      }, 3000);

    } catch (error) {
      console.warn('TomTom map initialization failed:', error);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mapLoaded, selectedVehicle, currentTrackingData, tomtomApiKey]);

  // Animation effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (animationPlaying && currentTrackingData.length > 0) {
      interval = setInterval(() => {
        setAnimationIndex((prev) => {
          if (prev >= currentTrackingData.length - 1) {
            setAnimationPlaying(false);
            return prev;
          }
          const newIndex = prev + 1;
          setSelectedPoint(currentTrackingData[newIndex]);
          updateCurrentMarker(currentTrackingData[newIndex]);
          return newIndex;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [animationPlaying, currentTrackingData]);

  const renderRoute = () => {
    if (!mapRef.current || currentTrackingData.length < 2) return;

    const coordinates = currentTrackingData.map(point => [point.longitude, point.latitude]);

    // Remove existing route layer
    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
      mapRef.current.removeSource('route');
    }

    // Add route source
    mapRef.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    });

    // Add route layer
    const routeLayer = {
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#1E6B7A',
        'line-width': 4
      }
    };

    mapRef.current.addLayer(routeLayer);
    routeLayerRef.current = 'route';
  };

  const renderMarkers = () => {
    if (!mapRef.current || !currentTrackingData.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    currentTrackingData.forEach((point, index) => {
      const isFirst = index === 0;
      const isLast = index === currentTrackingData.length - 1;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'tomtom-marker';
      markerElement.style.width = '12px';
      markerElement.style.height = '12px';
      markerElement.style.borderRadius = '50%';
      markerElement.style.border = '2px solid white';
      markerElement.style.cursor = 'pointer';
      markerElement.style.backgroundColor = isFirst ? '#10B981' : isLast ? '#EF4444' : '#1E6B7A';

      const marker = new window.tt.Marker(markerElement)
        .setLngLat([point.longitude, point.latitude])
        .addTo(mapRef.current);

      // Add click event
      markerElement.addEventListener('click', () => {
        handlePointSelect(point);
      });

      // Create popup
      const popup = new window.tt.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <p class="font-medium text-primary">${point.plate}</p>
            <p class="text-sm text-muted-foreground">${formatDate(point.date)}</p>
            <p class="text-sm">Velocidade: ${point.speed} km/h</p>
            <p class="text-sm">Ignição: ${point.ignition === 'ON' ? 'Ligado' : 'Desligado'}</p>
            ${point.batteryPercentual ? `<p class="text-sm">Bateria: ${point.batteryPercentual}</p>` : ''}
          </div>
        `);

      marker.setPopup(popup);
      markersRef.current.push(marker);
    });

    // Set initial selected point
    if (currentTrackingData.length > 0 && !selectedPoint) {
      setSelectedPoint(currentTrackingData[0]);
    }
  };

  const updateCurrentMarker = (point: TrackingPoint) => {
    if (!mapRef.current) return;

    // Remove existing current marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    // Create animated current position marker
    const currentElement = document.createElement('div');
    currentElement.style.width = '20px';
    currentElement.style.height = '20px';
    currentElement.style.borderRadius = '50%';
    currentElement.style.backgroundColor = '#1E6B7A';
    currentElement.style.border = '3px solid white';
    currentElement.style.boxShadow = '0 0 10px rgba(30, 107, 122, 0.6)';
    currentElement.style.animation = 'pulse 2s infinite';

    const currentMarker = new window.tt.Marker(currentElement)
      .setLngLat([point.longitude, point.latitude])
      .addTo(mapRef.current);

    currentMarkerRef.current = currentMarker;

    // Pan to current position
    mapRef.current.easeTo({
      center: [point.longitude, point.latitude],
      duration: 500
    });
  };

  const fitMapToRoute = () => {
    if (!mapRef.current || currentTrackingData.length === 0) return;

    const bounds = new window.tt.LngLatBounds();
    currentTrackingData.forEach(point => {
      bounds.extend([point.longitude, point.latitude]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const handlePointSelect = (point: TrackingPoint) => {
    setSelectedPoint(point);
    const pointIndex = currentTrackingData.findIndex(p => p.positionId === point.positionId);
    setAnimationIndex(pointIndex);
    updateCurrentMarker(point);
  };

  const handleAnimationControl = () => {
    if (animationPlaying) {
      setAnimationPlaying(false);
    } else {
      if (animationIndex >= currentTrackingData.length - 1) {
        setAnimationIndex(0);
      }
      setAnimationPlaying(true);
    }
  };

  const resetAnimation = () => {
    setAnimationPlaying(false);
    setAnimationIndex(0);
    if (currentTrackingData.length > 0) {
      setSelectedPoint(currentTrackingData[0]);
      updateCurrentMarker(currentTrackingData[0]);
    }
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
      currentMarkerRef.current = null;
    }
  };

  const getRouteStats = () => {
    if (currentTrackingData.length === 0) return null;

    const totalDistance = currentTrackingData.length > 1 
      ? calculateDistance(currentTrackingData[0], currentTrackingData[currentTrackingData.length - 1])
      : 0;
    
    const maxSpeed = Math.max(...currentTrackingData.map(p => p.speed));
    const avgSpeed = currentTrackingData.reduce((sum, p) => sum + p.speed, 0) / currentTrackingData.length;
    
    const duration = currentTrackingData.length > 1
      ? (new Date(currentTrackingData[currentTrackingData.length - 1].date).getTime() - 
         new Date(currentTrackingData[0].date).getTime()) / 1000 / 60
      : 0;

    return { totalDistance, maxSpeed, avgSpeed, duration };
  };

  const calculateDistance = (point1: TrackingPoint, point2: TrackingPoint) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const stats = getRouteStats();

  // SVG Map helper functions (fallback when TomTom is not available)
  const calculateBounds = () => {
    if (currentTrackingData.length === 0) return null;

    const lats = currentTrackingData.map(p => p.latitude);
    const lngs = currentTrackingData.map(p => p.longitude);
    
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  };

  const bounds = calculateBounds();

  const coordinateToSvg = (lat: number, lng: number) => {
    if (!bounds) return { x: 0, y: 0 };
    
    const padding = 40;
    const width = 800 - 2 * padding;
    const height = 600 - 2 * padding;
    
    const x = padding + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = padding + (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    
    return { x, y };
  };

  const generatePath = () => {
    if (currentTrackingData.length < 2) return '';
    
    const visiblePoints = animationPlaying 
      ? currentTrackingData.slice(0, animationIndex + 1)
      : currentTrackingData;
    
    const points = visiblePoints.map(point => coordinateToSvg(point.latitude, point.longitude));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    
    return path;
  };

  // API Key management functions
  const handleApiKeySubmit = () => {
    if (apiKeyInput.trim()) {
      setTomtomApiKey(apiKeyInput.trim());
      localStorage.setItem('tomtom-api-key', apiKeyInput.trim());
      setShowApiKeyInput(false);
      setApiKeyInput("");
    }
  };

  const clearApiKey = () => {
    setTomtomApiKey("");
    localStorage.removeItem('tomtom-api-key');
    setShowApiKeyInput(false);
  };

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('tomtom-api-key');
    if (savedKey) {
      setTomtomApiKey(savedKey);
    }
  }, []);

  // Auto-select first vehicle with data when available
  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0 && Object.keys(trackingData).length > 0) {
      const vehicleWithData = vehicles.find(vehicle => 
        trackingData[vehicle] && trackingData[vehicle].length > 0
      );
      if (vehicleWithData) {
        console.log('Auto-selecting vehicle with data:', vehicleWithData);
        setSelectedVehicle(vehicleWithData);
      }
    }
  }, [vehicles, trackingData, selectedVehicle]);

  // Check if we should use TomTom map or SVG fallback
  const useTomTomMap = mapLoaded && window.tt && tomtomApiKey && tomtomApiKey !== 'demo-key-replace-with-your-tomtom-api-key' && !tomtomLoadFailed;
  const showSvgMap = selectedVehicle && currentTrackingData.length > 0 && !useTomTomMap;

  return (
    <div 
      className="space-y-6"
      style={{ 
        isolation: 'isolate',
        contain: 'layout style paint'
      }}
    >
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .tomtom-marker {
          transition: all 0.2s ease;
        }
        .tomtom-marker:hover {
          transform: scale(1.2);
        }
      `}</style>

      {/* Header Controls */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5" />
            Visualização de Rotas
          </CardTitle>
          {!selectedVehicle && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                💡 Para visualizar uma rota: Selecione um veículo no dropdown abaixo
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder={`Selecione um veículo (${vehicles.length} disponíveis)`} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => {
                    const hasData = trackingData[vehicle] && trackingData[vehicle].length > 0;
                    const pointCount = hasData ? trackingData[vehicle].length : 0;
                    return (
                      <SelectItem key={vehicle} value={vehicle}>
                        <div className="flex justify-between items-center w-full">
                          <span>{vehicle}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {pointCount > 0 ? `${pointCount} pontos` : 'Sem dados'}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedVehicle && currentTrackingData.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAnimationControl}
                    className="bg-card border border-border hover:bg-muted transition-colors"
                  >
                    {animationPlaying ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-primary" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetAnimation}
                    className="bg-card border border-border hover:bg-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </>
              )}
              
              {/* Debug Button */}


              {/* TomTom API Key Configuration */}
              <Dialog open={showApiKeyInput} onOpenChange={setShowApiKeyInput}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-card border border-border hover:bg-muted transition-colors"
                    title="Configurar TomTom API Key"
                  >
                    <Key className={`w-4 h-4 ${tomtomApiKey && tomtomApiKey !== 'demo-key-replace-with-your-tomtom-api-key' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-primary">Configurar TomTom API Key</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      Para usar mapas interativos TomTom, insira sua chave de API. 
                      <a 
                        href="https://developer.tomtom.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        Obtenha sua chave aqui
                      </a>
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    
                    <Input
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Insira sua TomTom API Key"
                      type="password"
                    />
                    
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        onClick={clearApiKey}
                        disabled={!tomtomApiKey || tomtomApiKey === 'demo-key-replace-with-your-tomtom-api-key'}
                      >
                        Limpar
                      </Button>
                      <Button onClick={handleApiKeySubmit} disabled={!apiKeyInput.trim()}>
                        Salvar
                      </Button>
                    </div>
                    
                    {tomtomApiKey && tomtomApiKey !== 'demo-key-replace-with-your-tomtom-api-key' && (
                      <div className="text-xs text-green-600 flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        API Key configurada e salva
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {selectedVehicle && currentTrackingData.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">Progresso da animação:</span>
                <Badge variant="outline">
                  {animationIndex + 1} / {currentTrackingData.length}
                </Badge>
              </div>
              <Slider
                value={[animationIndex]}
                onValueChange={(values) => {
                  setAnimationIndex(values[0]);
                  const point = currentTrackingData[values[0]];
                  setSelectedPoint(point);
                  updateCurrentMarker(point);
                }}
                max={currentTrackingData.length - 1}
                step={1}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map and Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg h-[600px]">
            <CardContent className="h-full px-[15px] py-[0px]">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                {useTomTomMap && selectedVehicle && currentTrackingData.length > 0 ? (
                  <div 
                    id="tomtom-map" 
                    className="w-full h-full"
                    style={{ 
                      minHeight: '400px',
                      isolation: 'isolate',
                      contain: 'layout style paint'
                    }}
                    onError={(e) => {
                      console.warn('TomTom Map CSS error handled:', e);
                    }}
                  ></div>
                ) : showSvgMap ? (
                  <div className="bg-muted rounded-lg h-full relative overflow-hidden px-[0px] py-[41px] mx-[0px] my-[17px]">
                    <svg className="w-full h-full" viewBox="0 0 800 600">
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" className="text-border"/>
                        </pattern>
                      </defs>
                      <rect width="800" height="600" fill="url(#grid)" />
                      
                      {/* Route path */}
                      <path 
                        d={generatePath()}
                        stroke="currentColor" 
                        strokeWidth="3" 
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      />
                      
                      {/* Route points */}
                      {currentTrackingData.map((point, index) => {
                        const { x, y } = coordinateToSvg(point.latitude, point.longitude);
                        const isFirst = index === 0;
                        const isLast = index === currentTrackingData.length - 1;
                        const isSelected = selectedPoint?.positionId === point.positionId;
                        const isVisible = !animationPlaying || index <= animationIndex;
                        
                        if (!isVisible) return null;
                        
                        return (
                          <g key={point.positionId}>
                            <circle 
                              cx={x} 
                              cy={y} 
                              r={isSelected ? 8 : isFirst || isLast ? 6 : 4}
                              fill={
                                isFirst ? "#10B981" : 
                                isLast ? "#EF4444" : 
                                isSelected ? "#1E6B7A" : "currentColor"
                              }
                              stroke="white"
                              strokeWidth="2"
                              className={`cursor-pointer hover:scale-110 transition-all ${!isSelected ? 'text-primary' : ''}`}
                              onClick={() => handlePointSelect(point)}
                            />
                            {(isFirst || isLast || isSelected) && (
                              <text 
                                x={x} 
                                y={y - 15} 
                                textAnchor="middle" 
                                className="text-xs font-medium fill-current pointer-events-none text-foreground"
                              >
                                {isFirst ? 'Início' : isLast ? 'Fim' : formatDate(point.date).split(' ')[1]}
                              </text>
                            )}
                          </g>
                        );
                      })}
                      
                      {/* Current position indicator during animation */}
                      {animationPlaying && currentTrackingData[animationIndex] && (
                        <g>
                          {(() => {
                            const point = currentTrackingData[animationIndex];
                            const { x, y } = coordinateToSvg(point.latitude, point.longitude);
                            return (
                              <>
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="12"
                                  fill="rgba(30, 107, 122, 0.3)"
                                  className="animate-pulse"
                                />
                                <circle 
                                  cx={x} 
                                  cy={y} 
                                  r="6"
                                  fill="#1E6B7A"
                                  stroke="white"
                                  strokeWidth="2"
                                />
                              </>
                            );
                          })()}
                        </g>
                      )}
                    </svg>
                    
                    {/* Map overlay info */}
                    <div className="absolute top-4 left-4 bg-card border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium text-primary">Visualização de Rota</p>
                      <p className="text-xs text-muted-foreground">
                        {currentTrackingData.length} pontos de rastreamento
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Selecione um veículo para ver a rota no mapa</p>
                      {selectedVehicle && currentTrackingData.length === 0 && (
                        <div className="text-center mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">
                            ⚠️ Sem dados de rastreamento para {selectedVehicle}
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                            Faça upload de dados JSON na seção "Upload JSON"
                          </p>
                        </div>
                      )}
                      {!selectedVehicle && vehicles.length === 0 && (
                        <div className="text-center mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                            🚫 Nenhum veículo cadastrado
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Cadastre veículos na seção "Veículos"
                          </p>
                        </div>
                      )}
                      {!useTomTomMap && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {tomtomLoadFailed 
                            ? "⚠️ TomTom Maps não disponível - usando visualização SVG"
                            : "Configure sua chave TomTom API para mapas interativos"
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Point Details */}
          {selectedPoint && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Detalhes do Ponto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(selectedPoint.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedPoint.speed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedPoint.latitude.toFixed(6)}, {selectedPoint.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedPoint.batteryPercentual || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Ignição:</span>
                  <Badge variant={selectedPoint.ignition === "ON" ? "default" : "secondary"}>
                    {selectedPoint.ignition === "ON" ? "Ligado" : "Desligado"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Statistics */}
          {stats && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Estatísticas da Rota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{currentTrackingData.length}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(stats.duration)}</p>
                    <p className="text-xs text-muted-foreground">Min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(stats.maxSpeed)}</p>
                    <p className="text-xs text-muted-foreground">Vel. Máx</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{Math.round(stats.avgSpeed)}</p>
                    <p className="text-xs text-muted-foreground">Vel. Média</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">
                      {stats.totalDistance.toFixed(2)} km
                    </p>
                    <p className="text-xs text-muted-foreground">Distância Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Info */}
          {selectedVehicle && currentTrackingData.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">Informações do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Placa:</span>
                  <span className="text-sm font-medium">{selectedVehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Modelo:</span>
                  <span className="text-sm font-medium">{currentTrackingData[0]?.deviceModel || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Device ID:</span>
                  <span className="text-sm font-medium">{currentTrackingData[0]?.deviceId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pontos de Tracking:</span>
                  <span className="text-sm font-medium">{currentTrackingData.length}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Guia de Uso */}
          {!selectedVehicle && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-primary">🗺️ Como Usar o Mapa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                    <span>Selecione um veículo no dropdown acima</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                    <span>A rota aparecerá automaticamente</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                    <span>Use ▶️ para animar o percurso</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                    <span>Configure TomTom API key (🔑) para mapas reais</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong>Veículos com dados:</strong> {Object.keys(trackingData).filter(key => trackingData[key].length > 0).join(', ') || 'Nenhum'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}