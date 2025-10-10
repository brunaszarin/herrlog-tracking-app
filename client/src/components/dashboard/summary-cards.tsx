import { useQuery } from "@tanstack/react-query";
import { Car, Zap, MapPin, Clock } from "lucide-react";

interface Stats {
  vehicleCount: number;
  activeVehicleCount: number;
  routesTrackedToday: number;
  lastUpdate: string;
}

export default function SummaryCards() {
  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-destructive/10 rounded-lg p-6 border border-destructive/20">
          <p className="text-sm text-destructive">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const formatLastUpdate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffMins < 1440) return `Há ${Math.floor(diffMins / 60)}h`;
    return `Há ${Math.floor(diffMins / 1440)} dias`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Vehicles Count */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">
            Total
          </span>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-vehicle-count">
          {isLoading ? "-" : stats?.vehicleCount || 0}
        </h3>
        <p className="text-sm text-muted-foreground">Veículos Cadastrados</p>
      </div>

      {/* Active Vehicles */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
            <Zap className="w-6 h-6 text-secondary" />
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            Ativo
          </span>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-active-vehicles">
          {isLoading ? "-" : stats?.activeVehicleCount || 0}
        </h3>
        <p className="text-sm text-muted-foreground">Veículos Ativos</p>
      </div>

      {/* Routes Tracked Today */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-accent-foreground" />
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
            Hoje
          </span>
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-1" data-testid="stat-routes-today">
          {isLoading ? "-" : stats?.routesTrackedToday || 0}
        </h3>
        <p className="text-sm text-muted-foreground">Rotas Rastreadas</p>
      </div>

      {/* Last Update */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <Clock className="w-6 h-6 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1" data-testid="stat-last-update">
          {isLoading ? "-" : formatLastUpdate(stats?.lastUpdate)}
        </h3>
        <p className="text-sm text-muted-foreground">Última Atualização</p>
      </div>
    </div>
  );
}
