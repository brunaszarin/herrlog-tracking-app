import { Car, Upload, Gauge, Route, TrendingUp, Clock, Battery, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardCardsProps {
  totalVehicles: number;
  recentUploads: number;
  averageSpeed: number;
  totalRoutes: number;
}

export function DashboardCards({ 
  totalVehicles, 
  recentUploads, 
  averageSpeed, 
  totalRoutes 
}: DashboardCardsProps) {
  const cards = [
    {
      title: "Total de Veículos",
      value: totalVehicles.toString(),
      change: "+2 novos",
      changeType: "positive" as const,
      icon: Car,
    },
    {
      title: "Uploads Recentes",
      value: recentUploads.toString(),
      change: "Últimos 7 dias",
      changeType: "neutral" as const,
      icon: Upload,
    },
    {
      title: "Velocidade Média",
      value: `${averageSpeed} km/h`,
      change: "+5% vs mês anterior",
      changeType: "positive" as const,
      icon: Gauge,
    },
    {
      title: "Rotas Processadas",
      value: totalRoutes.toString(),
      change: "Total acumulado",
      changeType: "neutral" as const,
      icon: Route,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className="rounded-lg bg-muted p-[10px]">
              <card.icon className="h-4 w-4 text-primary" data-testid={`icon-${card.title.toLowerCase().replace(/\s+/g, '-')}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary mb-1" data-testid={`value-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
              {card.value}
            </div>
            <div className="flex items-center gap-1">
              {card.changeType === "positive" && (
                <TrendingUp className="h-3 w-3 text-primary" />
              )}
              <p className={`text-xs ${
                card.changeType === "positive" 
                  ? "text-primary" 
                  : "text-muted-foreground"
              }`} data-testid={`change-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
                {card.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function RecentActivity() {
  const activities = [
    {
      type: "upload",
      message: "Dados de rastreamento carregados para JBD2F63",
      time: "2 minutos atrás",
      icon: Upload,
    },
    {
      type: "vehicle",
      message: "Novo veículo ISX0J70 cadastrado",
      time: "15 minutos atrás",
      icon: Car,
    },
    {
      type: "route",
      message: "Rota de 45km processada para IPO0E20",
      time: "1 hora atrás",
      icon: MapPin,
    },
    {
      type: "alert",
      message: "Bateria baixa detectada em ISB0642",
      time: "2 horas atrás",
      icon: Battery,
    },
  ];

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="h-5 w-5 text-primary" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
              <div className="rounded-full bg-card p-2">
                <activity.icon className="h-4 w-4 text-primary" data-testid={`activity-icon-${activity.type}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid={`activity-message-${index}`}>
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-time-${index}`}>{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VehicleStatusOverview() {
  const statuses = [
    { label: "Online", count: 12, color: "bg-green-500" },
    { label: "Offline", count: 3, color: "bg-red-500" },
    { label: "Manutenção", count: 1, color: "bg-yellow-500" },
    { label: "Inativo", count: 2, color: "bg-gray-500" },
  ];

  return (
    <Card className="shadow-sm border border-border">
      <CardHeader>
        <CardTitle className="text-primary">Status dos Veículos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statuses.map((status, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between"
              data-testid={`status-${status.label.toLowerCase()}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} data-testid={`status-indicator-${status.label.toLowerCase()}`} />
                <span className="text-sm font-medium text-foreground">
                  {status.label}
                </span>
              </div>
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground" data-testid={`status-count-${status.label.toLowerCase()}`}>
                {status.count}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
