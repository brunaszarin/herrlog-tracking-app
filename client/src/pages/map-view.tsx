import RouteMap from "@/components/map/route-map";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@shared/schema";

export default function MapView() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mapa de Rotas</h2>
        <p className="text-muted-foreground mt-1">Visualize as rotas dos veículos no mapa</p>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border p-6" data-testid="card-vehicle-selector">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Selecione um Veículo</label>
          <Select value={selectedVehicleId || undefined} onValueChange={setSelectedVehicleId} data-testid="select-vehicle">
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Escolha um veículo" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <RouteMap vehicleId={selectedVehicleId} />
    </div>
  );
}
