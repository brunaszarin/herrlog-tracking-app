import { useQuery } from "@tanstack/react-query";
import { Battery, Gauge, Navigation, Clock } from "lucide-react";
import type { Vehicle, GpsData } from "@shared/schema";

interface VehicleDetailsPanelProps {
  vehicleId: string;
}

export default function VehicleDetailsPanel({ vehicleId }: VehicleDetailsPanelProps) {
  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ['/api/vehicles', vehicleId],
    enabled: !!vehicleId,
  });

  const { data: latestGpsData, isLoading: gpsLoading } = useQuery<GpsData>({
    queryKey: ['/api/vehicles', vehicleId, 'latest-position'],
    enabled: !!vehicleId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (vehicleLoading || gpsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <p className="text-sm text-muted-foreground">Veículo não encontrado</p>
        </div>
      </div>
    );
  }

  const formatVoltage = (voltage?: number | null) => {
    return voltage ? `${voltage.toFixed(2)}V` : 'N/A';
  };

  const formatDistance = (distance?: number | null) => {
    if (!distance) return 'N/A';
    return `${distance.toLocaleString('pt-BR')} km`;
  };

  const formatTime = (time?: number | null) => {
    if (!time) return 'N/A';
    return `${time.toLocaleString('pt-BR')} h`;
  };

  const getBatteryLevel = (voltage?: number | null) => {
    if (!voltage) return 0;
    // Rough calculation: 24V system, assume 20V = 0%, 28V = 100%
    const percentage = Math.min(100, Math.max(0, ((voltage - 20) / 8) * 100));
    return Math.round(percentage);
  };

  const batteryLevel = getBatteryLevel(latestGpsData?.mainBattery);

  return (
    <div className="space-y-6">
      {/* Vehicle Info Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4" data-testid="vehicle-info-title">
          Informações do Veículo
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Placa</p>
            <p className="text-sm font-semibold text-foreground" data-testid="vehicle-plate">
              {vehicle.plate}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Modelo</p>
            <p className="text-sm font-semibold text-foreground" data-testid="vehicle-model">
              {vehicle.model}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Device ID</p>
            <p className="text-sm font-mono text-foreground" data-testid="vehicle-device-id">
              {vehicle.deviceId}
            </p>
          </div>
          {vehicle.manufacturer && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fabricante</p>
              <p className="text-sm font-semibold text-foreground">
                {vehicle.manufacturer}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                vehicle.status === 'active' ? 'bg-green-500' :
                vehicle.status === 'inactive' ? 'bg-gray-500' :
                'bg-yellow-500'
              }`}></div>
              <p className={`text-sm font-semibold ${
                vehicle.status === 'active' ? 'text-green-600' :
                vehicle.status === 'inactive' ? 'text-gray-600' :
                'text-yellow-600'
              }`} data-testid="vehicle-status">
                {vehicle.status === 'active' ? 'Ativo' :
                 vehicle.status === 'inactive' ? 'Inativo' :
                 'Manutenção'}
              </p>
            </div>
          </div>
          {latestGpsData?.ignition !== undefined && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ignição</p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${latestGpsData.ignition ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p className={`text-sm font-semibold ${latestGpsData.ignition ? 'text-green-600' : 'text-red-600'}`}>
                  {latestGpsData.ignition ? 'Ligado' : 'Desligado'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Card */}
      {latestGpsData && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Telemetria</h3>
          <div className="space-y-4">
            {/* Main Battery */}
            {latestGpsData.mainBattery && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-secondary" />
                    <span className="text-xs text-muted-foreground">Bateria Principal</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground" data-testid="main-battery">
                    {formatVoltage(latestGpsData.mainBattery)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      batteryLevel > 50 ? 'bg-secondary' : 
                      batteryLevel > 25 ? 'bg-yellow-500' : 'bg-destructive'
                    }`}
                    style={{ width: `${batteryLevel}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{batteryLevel}%</div>
              </div>
            )}

            {/* Backup Battery */}
            {latestGpsData.backupBattery && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Bateria Backup</span>
                <span className="text-sm font-semibold text-foreground" data-testid="backup-battery">
                  {formatVoltage(latestGpsData.backupBattery)}
                </span>
              </div>
            )}

            {/* Speed */}
            {latestGpsData.speed !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Gauge className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Velocidade Atual</span>
                </div>
                <span className="text-sm font-semibold text-foreground" data-testid="current-speed">
                  {Math.round(latestGpsData.speed || 0)} km/h
                </span>
              </div>
            )}

            {/* Direction */}
            {latestGpsData.direction !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-accent-foreground" />
                  <span className="text-xs text-muted-foreground">Direção</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {latestGpsData.direction?.toFixed(1)}°
                </span>
              </div>
            )}

            {/* Odometer */}
            {latestGpsData.odometer && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Odômetro</span>
                <span className="text-sm font-semibold text-foreground" data-testid="odometer">
                  {formatDistance(latestGpsData.odometer)}
                </span>
              </div>
            )}

            {/* Horimeter */}
            {latestGpsData.horimeter && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Horímetro</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatTime(latestGpsData.horimeter)}
                </span>
              </div>
            )}

            {/* Last Update */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Última Atualização</span>
                <span className="text-xs text-foreground" data-testid="last-update">
                  {new Date(latestGpsData.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
