import React, { useState, useEffect } from "react";
import { LoginPage } from "./components/LoginPage";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardCards, RecentActivity, VehicleStatusOverview } from "./components/DashboardCards";
import { VehicleTable } from "./components/VehicleTable";
import { VehicleFormModal } from "./components/VehicleFormModal";
import { UploadJSONCard } from "./components/UploadJSONCard";
import { MapRouteViewer } from "./components/MapRouteViewer";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { projectId, publicAnonKey } from './utils/supabase/info';

// Comprehensive CSS SecurityError suppression
const suppressCSSErrors = () => {
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  // Store original methods globally to prevent override
  (window as any).__originalConsole = {
    error: originalError,
    warn: originalWarn,
    log: originalLog
  };
  
  const shouldSuppress = (message: string) => {
    return message.includes('cssRules') || 
           message.includes('CSSStyleSheet') || 
           message.includes('SecurityError') ||
           message.includes('Failed to read') ||
           message.includes('Cannot access rules') ||
           message.includes('stylesheet') ||
           message.includes('CORS') ||
           message.includes('Access-Control-Allow-Origin');
  };
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    if (shouldSuppress(message)) return;
    originalError.apply(console, args);
  };
  
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    if (shouldSuppress(message)) return;
    originalWarn.apply(console, args);
  };
  
  // Override global error handlers
  const originalOnerror = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const msg = message?.toString() || '';
    if (shouldSuppress(msg)) return true;
    return originalOnerror ? originalOnerror(message, source, lineno, colno, error) : false;
  };
  
  const originalOnunhandledrejection = window.onunhandledrejection;
  window.onunhandledrejection = (event) => {
    const msg = event.reason?.toString() || '';
    if (shouldSuppress(msg)) {
      event.preventDefault();
      return;
    }
    if (originalOnunhandledrejection) originalOnunhandledrejection(event);
  };
};

// Apply CSS error suppression immediately
suppressCSSErrors();

// Comprehensive window error suppression
window.addEventListener('error', (event) => {
  const message = event.message || event.error?.message || '';
  if (message.includes('cssRules') || 
      message.includes('CSSStyleSheet') || 
      message.includes('SecurityError') ||
      message.includes('Failed to read') ||
      message.includes('Cannot access rules') ||
      message.includes('stylesheet') ||
      message.includes('CORS')) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.toString() || '';
  if (message.includes('cssRules') || 
      message.includes('CSSStyleSheet') || 
      message.includes('SecurityError') ||
      message.includes('Failed to read') ||
      message.includes('Cannot access rules') ||
      message.includes('stylesheet') ||
      message.includes('CORS')) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

interface Vehicle {
  id: string;
  plate: string;
  deviceModel: string;
  deviceId: number;
  ignitionStatus: "ON" | "OFF";
  lastUpdate: string;
  batteryLevel?: string;
  status: "Online" | "Offline" | "Maintenance" | "Inactive";
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
}

// Dados fixos simplificados para teste
const SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: "herrlog_1",
    plate: "JBD2F63",
    deviceModel: "ST310",
    deviceId: 511353816,
    ignitionStatus: "ON",
    lastUpdate: "2025-09-26T16:06:22",
    batteryLevel: "93%",
    status: "Online"
  },
  {
    id: "herrlog_2", 
    plate: "IPO0E20",
    deviceModel: "ST8310U",
    deviceId: 1970034780,
    ignitionStatus: "ON",
    lastUpdate: "2025-09-26T16:06:58",
    batteryLevel: "",
    status: "Online"
  },
  {
    id: "herrlog_3",
    plate: "ISX0J70", 
    deviceModel: "ST310UC2",
    deviceId: 807328476,
    ignitionStatus: "ON",
    lastUpdate: "2025-09-26T16:06:35",
    batteryLevel: "96%",
    status: "Online"
  },
  {
    id: "herrlog_4",
    plate: "ISB0642",
    deviceModel: "ST8310UM", 
    deviceId: 180091986,
    ignitionStatus: "OFF",
    lastUpdate: "2025-09-26T16:01:08",
    batteryLevel: "",
    status: "Offline"
  },
  {
    id: "herrlog_5",
    plate: "IZT1A90",
    deviceModel: "ST310UC2",
    deviceId: 807435864,
    ignitionStatus: "ON", 
    lastUpdate: "2025-09-26T16:05:01",
    batteryLevel: "96%",
    status: "Online"
  }
];

const SAMPLE_TRACKING: Record<string, TrackingPoint[]> = {
  "JBD2F63": [
    {
      plate: "JBD2F63",
      deviceModel: "ST310",
      deviceId: 511353816,
      positionId: 253604182,
      date: "2025-09-26T12:58:22",
      latitude: -29.943495,
      longitude: -51.204738,
      speed: 89,
      ignition: "ON",
      batteryPercentual: "93%"
    },
    {
      plate: "JBD2F63",
      deviceModel: "ST310", 
      deviceId: 511353816,
      positionId: 253604607,
      date: "2025-09-26T12:59:22",
      latitude: -29.931302,
      longitude: -51.21284,
      speed: 95,
      ignition: "ON",
      batteryPercentual: "93%"
    },
    {
      plate: "JBD2F63",
      deviceModel: "ST310",
      deviceId: 511353816,
      positionId: 253604633,
      date: "2025-09-26T13:00:22",
      latitude: -29.924318,
      longitude: -51.226985,
      speed: 95,
      ignition: "ON",
      batteryPercentual: "93%"
    },
    {
      plate: "JBD2F63",
      deviceModel: "ST310",
      deviceId: 511353816,
      positionId: 253604887,
      date: "2025-09-26T13:01:22",
      latitude: -29.913233,
      longitude: -51.236955,
      speed: 95,
      ignition: "ON",
      batteryPercentual: "93%"
    },
    {
      plate: "JBD2F63",
      deviceModel: "ST310",
      deviceId: 511353816,
      positionId: 253605168,
      date: "2025-09-26T13:02:22",
      latitude: -29.901885,
      longitude: -51.244727,
      speed: 94,
      ignition: "ON",
      batteryPercentual: "93%"
    }
  ],
  "IPO0E20": [
    {
      plate: "IPO0E20",
      deviceModel: "ST8310U",
      deviceId: 1970034780,
      positionId: 253604256,
      date: "2025-09-26T12:58:44",
      latitude: -30.097372,
      longitude: -51.342875,
      speed: 86,
      ignition: "ON",
      batteryPercentual: ""
    },
    {
      plate: "IPO0E20",
      deviceModel: "ST8310U",
      deviceId: 1970034780,
      positionId: 253604464,
      date: "2025-09-26T12:59:44",
      latitude: -30.084052,
      longitude: -51.341743,
      speed: 87,
      ignition: "ON",
      batteryPercentual: ""
    },
    {
      plate: "IPO0E20",
      deviceModel: "ST8310U",
      deviceId: 1970034780,
      positionId: 253604703,
      date: "2025-09-26T13:00:44",
      latitude: -30.071545,
      longitude: -51.34068,
      speed: 89,
      ignition: "ON",
      batteryPercentual: ""
    },
    {
      plate: "IPO0E20",
      deviceModel: "ST8310U",
      deviceId: 1970034780,
      positionId: 253605004,
      date: "2025-09-26T13:01:44",
      latitude: -30.058378,
      longitude: -51.337827,
      speed: 82,
      ignition: "ON",
      batteryPercentual: ""
    },
    {
      plate: "IPO0E20",
      deviceModel: "ST8310U",
      deviceId: 1970034780,
      positionId: 253605278,
      date: "2025-09-26T13:02:44",
      latitude: -30.045988,
      longitude: -51.331847,
      speed: 89,
      ignition: "ON",
      batteryPercentual: ""
    }
  ],
  "ISX0J70": [
    {
      plate: "ISX0J70",
      deviceModel: "ST310UC2",
      deviceId: 807328476,
      positionId: 253604305,
      date: "2025-09-26T12:58:35",
      latitude: -30.074187,
      longitude: -51.01583,
      speed: 74,
      ignition: "ON",
      batteryPercentual: "96%"
    },
    {
      plate: "ISX0J70",
      deviceModel: "ST310UC2",
      deviceId: 807328476,
      positionId: 253604428,
      date: "2025-09-26T12:59:35",
      latitude: -30.065182,
      longitude: -51.016413,
      speed: 40,
      ignition: "ON",
      batteryPercentual: "96%"
    },
    {
      plate: "ISX0J70",
      deviceModel: "ST310UC2",
      deviceId: 807328476,
      positionId: 253604779,
      date: "2025-09-26T13:00:35",
      latitude: -30.056612,
      longitude: -51.011218,
      speed: 70,
      ignition: "ON",
      batteryPercentual: "96%"
    }
  ]
};

export default function App() {
  console.log('🚀 HERRLOG: App component initializing...');
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trackingData, setTrackingData] = useState<Record<string, TrackingPoint[]>>({});
  const [userName, setUserName] = useState("Admin");
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('🎛️ HERRLOG: State initialized', { isLoggedIn, vehicles: vehicles.length });

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1156d058`;

  // Apply dark mode to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Reinforce CSS error suppression after component initialization
  useEffect(() => {
    const reinforceSupression = () => {
      suppressCSSErrors();
    };
    
    // Apply immediately and reinforce periodically
    reinforceSupression();
    const timeout = setTimeout(reinforceSupression, 100);
    const interval = setInterval(reinforceSupression, 1000);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // Suppress CSS errors on every render
  useEffect(() => {
    suppressCSSErrors();
  });

  // Carregamento inicial simples
  useEffect(() => {
    if (isLoggedIn) {
      console.log('🚀 HERRLOG: Carregando dados iniciais...');
      
      // Carregar dados imediatamente
      setVehicles(SAMPLE_VEHICLES);
      setTrackingData(SAMPLE_TRACKING);
      
      console.log('✅ HERRLOG: Dados carregados!', {
        vehicles: SAMPLE_VEHICLES.length,
        trackingKeys: Object.keys(SAMPLE_TRACKING)
      });
      
      toast.success("Sistema carregado com sucesso!");
    }
  }, [isLoggedIn]);

  const handleLogin = (email: string, password: string) => {
    console.log('🔐 HERRLOG: Login attempt:', email);
    setUserName(email.split('@')[0]);
    setIsLoggedIn(true);
    toast.success("Login realizado com sucesso!");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection("dashboard");
    setUserName("Admin");
    setVehicles([]);
    setTrackingData({});
    toast.success("Logout realizado com sucesso!");
  };

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      const newVehicle: Vehicle = {
        id: `herrlog_${Date.now()}`,
        ...vehicleData,
        lastUpdate: new Date().toISOString()
      };

      setVehicles(prev => [...prev, newVehicle]);
      toast.success("Veículo adicionado com sucesso!");
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Erro ao adicionar veículo');
    }
  };

  const handleEditVehicle = async (vehicle: Vehicle) => {
    try {
      setVehicles(prev => prev.map(v => 
        v.id === vehicle.id ? { ...vehicle, lastUpdate: new Date().toISOString() } : v
      ));
      toast.success("Veículo atualizado com sucesso!");
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Erro ao atualizar veículo');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm("Tem certeza que deseja deletar este veículo?")) {
      try {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
        
        // Remover dados de tracking
        setTrackingData(prev => {
          const vehicle = vehicles.find(v => v.id === vehicleId);
          if (vehicle) {
            const { [vehicle.plate]: removed, ...rest } = prev;
            return rest;
          }
          return prev;
        });
        
        toast.success("Veículo deletado com sucesso!");
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Erro ao deletar veículo');
      }
    }
  };

  const handleViewRoute = (vehicle: Vehicle) => {
    setActiveSection("map");
    toast.info(`Visualizando rota do veículo ${vehicle.plate}`);
  };

  const handleFileUpload = async (file: File): Promise<{ success: boolean; processedPoints?: number; error?: string }> => {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      if (!Array.isArray(jsonData)) {
        throw new Error("Arquivo deve conter um array de dados de rastreamento");
      }

      // Group by plate
      const groupedData: Record<string, TrackingPoint[]> = {};
      let totalProcessedCount = 0;

      jsonData.forEach((point) => {
        if (point.plate && point.latitude && point.longitude && point.date) {
          if (!groupedData[point.plate]) {
            groupedData[point.plate] = [];
          }
          
          groupedData[point.plate].push({
            plate: point.plate,
            deviceModel: point.deviceModel || "",
            deviceId: point.deviceId || 0,
            positionId: point.positionId || Date.now(),
            date: point.date,
            latitude: Number(point.latitude),
            longitude: Number(point.longitude),
            speed: Number(point.speed) || 0,
            ignition: point.ignition || "OFF",
            batteryPercentual: point.batteryPercentual || ""
          });
          totalProcessedCount++;
        }
      });

      setTrackingData(prev => ({
        ...prev,
        ...groupedData
      }));

      toast.success(`${totalProcessedCount} pontos de rastreamento processados!`);
      return { success: true, processedPoints: totalProcessedCount };
    } catch (error) {
      toast.error("Erro ao processar arquivo JSON");
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro ao processar arquivo"
      };
    }
  };

  if (!isLoggedIn) {
    console.log('🔐 HERRLOG: Showing login page');
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LoginPage onLogin={handleLogin} />
      </div>
    );
  }
  
  console.log('🏠 HERRLOG: User logged in, showing main app');

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">

              </div>
            </div>

            {/* Status Cards */}

            
            <DashboardCards
              totalVehicles={vehicles.length}
              recentUploads={Object.keys(trackingData).length}
              averageSpeed={
                Object.values(trackingData).length > 0 
                  ? Math.round(
                      Object.values(trackingData)
                        .flat()
                        .reduce((sum, point) => sum + point.speed, 0) / 
                      Object.values(trackingData).flat().length
                    )
                  : 0
              }
              totalRoutes={Object.values(trackingData).reduce((sum, routes) => sum + routes.length, 0)}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivity />
              <VehicleStatusOverview />
            </div>
          </div>
        );

      case "vehicles":
        return (
          <VehicleTable
            vehicles={vehicles}
            onEdit={handleEditVehicle}
            onDelete={handleDeleteVehicle}
            onViewRoute={handleViewRoute}
            onAdd={handleAddVehicle}
          />
        );

      case "upload":
        return <UploadJSONCard onFileUpload={handleFileUpload} />;

      case "map":
        return (
          <MapRouteViewer
            vehicles={vehicles.map(v => v.plate)}
            trackingData={trackingData}
          />
        );

      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-primary mb-4">Configurações</h2>
            <p className="text-muted-foreground">Painel de configurações em desenvolvimento</p>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-primary mb-4">Seção não encontrada</h2>
            <p className="text-muted-foreground">A seção solicitada não foi encontrada</p>
          </div>
        );
    }
  };

  console.log('🖥️ HERRLOG: Rendering app with', vehicles.length, 'vehicles');

  try {
    return (
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <Sidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userName={userName}
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Header */}
          <Header 
            currentSection={activeSection}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />
          
          {/* Content area */}
          <div 
            className="flex-1 p-6 overflow-auto bg-background"
            style={{ 
              isolation: 'isolate',
              contain: 'layout style paint'
            }}
          >
            {renderContent()}
          </div>
        </div>
        
        <Toaster />
      </div>
    );
  } catch (error) {
    console.error('❌ HERRLOG: Render error:', error);
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro no Sistema HERRLOG</h1>
          <p className="text-red-700">Problema de renderização detectado</p>
          <pre className="mt-4 p-4 bg-red-100 rounded text-xs text-left overflow-auto">
            {error instanceof Error ? error.message : String(error)}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }
}